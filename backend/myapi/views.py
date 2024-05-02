from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.contrib.auth import login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer, ChangePasswordSerializer
from rest_framework import permissions, status
from .validations import custom_validation, validate_email, validate_password
from .models import TaxTransactionForm, BankTransactionList
from datetime import datetime
from django.http import HttpRequest, JsonResponse, HttpResponse
from django.conf import settings
import os
import shutil
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned

class SessionStatus(APIView):
    permission_classes = ()
    authentication_classes = ()
    def check_sessionid_cookie_exists(self, request: HttpRequest) -> bool:
        return 'sessionid' in request.COOKIES

    def get(self, request):
        if self.check_sessionid_cookie_exists(request):
            return Response(data={ "exist": True }, status=status.HTTP_200_OK)
        else:
            return Response(data={ "exist": False }, status=status.HTTP_204_NO_CONTENT)


class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request):
        clean_data = custom_validation(request.data)
        serializer = UserRegisterSerializer(data=clean_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(clean_data)
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)
    def post(self, request):
        data = request.data
        assert validate_email(data)
        assert validate_password(data)
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            try:
                user = serializer.check_user(data)
                login(request, user)
                return  Response(serializer.data, status=status.HTTP_200_OK)
            except ValidationError:
                return Response(data={"reason": "Non existing user"}, status=status.HTTP_400_BAD_REQUEST)

class UserLogout(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)

class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data}, status=status.HTTP_200_OK)

class UpdatePassword(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    def post(self, request):
        data = request.data
        login_data = {"email": data.get("email"), "password": data.get("old_password")}

        login_serializer = UserLoginSerializer(data=login_data)
        if login_serializer.is_valid(raise_exception=True):
            try:
                user = login_serializer.check_user(login_data)
            except ValidationError:
                return Response(data={"reason": "Non existing user"}, status=status.HTTP_400_BAD_REQUEST)        

        serializer = ChangePasswordSerializer(data=data)

        if serializer.is_valid():
            user.set_password(data.get("new_password"))
            user.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CardTransactionUpload(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    def post(self, request):
        data = request.data
        try:
            TaxTransactionForm.objects.create_transaction(
                trans_date=data['date'],
                billing_amount=float(data['billing_amount']),
                tps=float(data['tps']),
                tvq=float(data['tvq']),
                merchant_name=data['merchant_name'],
                category=data['category'],
                purpose=data['purpose'],
                first_name=data['first_name'].upper(),
                last_name=data['last_name'].upper(),
                img=data['file'],
                project=data['project'],
                attendees=data['attendees'],
                department=data['department'],
            )
            return Response({'message': 'Transaction created successfully'})

        except Exception as e:
            return Response({ "message": f"error: {e}" }, status=status.HTTP_400_BAD_REQUEST)

class CardTransactionHistory(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)
    def get(self, request):
        serializer = UserSerializer(request.user)

        first_name = serializer.data['first_name']
        last_name = serializer.data['last_name']

        today = datetime.now().date()

        my_data = TaxTransactionForm.objects.filter(trans_date__range=(today.replace(day=1), today), first_name=first_name.upper(), last_name=last_name.upper())
        data_list = list(my_data.values())
        
        return JsonResponse(data_list, safe=False)

class EntireCardTransactionHistory(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)
    def get(self, request):
        serializer = UserSerializer(request.user)

        first_name = serializer.data['first_name']
        last_name = serializer.data['last_name']

        my_data = TaxTransactionForm.objects.filter(first_name=first_name.upper(), last_name=last_name.upper())
        data_list = list(my_data.values())
        
        return JsonResponse(data_list, safe=False)

class DownloadTransactions(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
        data = request.data
        date_from = data.get('date_from')
        date_to = data.get('date_to')
        department_info = {'SOONKI JEONG' : 'IT Security', 'JUNGHOON HA': 'Contruction Operation', 'JONGHOON LEE' : 'Finance', 'HWA SUNG KANG' : 'Procurement', 'WEON-KU YEO': 'Contruction Operation', 'CHI GYU CHA': 'President'}
        department_info_names = list(department_info.keys())

        constructions = ['Procurement', 'Contruction Operation']
        construction_options = ['12395202 Construction in progress_travel expenses', '12395213 Construction in progress_entertainment expenses', '12395201-1 Construction in progress_welfare expenses_supporting discussion', '12395224 Construction in progress_conference expenses', '52216111 Bank charges', '12395221 Construction in progress_vehicles expenses']
        general_options = ['52202101 Travel', '52212102 Selling and administrative expenses_entertainment expenses_employees', '52201123 Selling and administrative expenses, welfare expenses, supporting discussion', '52224102 Selling and administrative expenses_conference expenses_employees', '52216111 Bank charges', '52221199 Car expenses']
        
        try:
            return_data = []
            bank_lists = BankTransactionList.objects.filter(post_date__range=(date_from, date_to))

            for item in bank_lists:
                try:
                    match_item = TaxTransactionForm.objects.get(trans_date=item.trans_date, billing_amount=item.billing_amount, first_name=item.first_name.upper(), last_name=item.last_name.upper())
                
                except ObjectDoesNotExist:
                    continue
                
                except MultipleObjectsReturned:
                    match_items = TaxTransactionForm.objects.filter(trans_date=item.trans_date, billing_amount=item.billing_amount, first_name=item.first_name.upper(), last_name=item.last_name.upper())    
                    match_item = match_items[0]

                department = ""
                full_name = item.first_name.upper() + item.last_name.upper()
                if full_name in department_info_names:
                    department = department_info[full_name]
                    
                if department in constructions:
                    if match_item.category == 'Business Trip(Hotel,Food,Gas,Parking,Toll,Trasportation)':
                        account = construction_options[0]
                    elif match_item.category == 'Meeting with Business Partners':
                        account = construction_options[1]
                    elif match_item.category == 'Meeting between employees':
                            account = construction_options[2]
                    elif match_item.category == 'Business Conference, Seminar, Workshop':
                        account = construction_options[3]
                    elif match_item.category == 'Banking Fees':
                        account = construction_options[4]
                    elif match_item.category == 'Car Expenses (Gas, Maintenance, Parking, Toll)':
                        account = construction_options[5]
                    else:
                        account = ""
                else:
                    if match_item.category == 'Business Trip(Hotel,Food,Gas,Parking,Toll,Trasportation)':
                        account = general_options[0]
                    elif match_item.category == 'Meeting with Business Partners':
                        account = general_options[1]
                    elif match_item.category == 'Meeting between employees':
                        account = general_options[2]
                    elif match_item.category == 'Business Conference, Seminar, Workshop':
                        account = general_options[3]
                    elif match_item.category == 'Banking Fees':
                        account = general_options[4]
                    elif match_item.category == 'Car Expenses (Gas, Maintenance, Parking, Toll)':
                        account = general_options[5]
                    else:
                        account = ""
                        
                item_dict = {
                    'Trans Date': item.trans_date,
                    'Post Date': item.post_date,
                    'Merchant Name': item.merchant_name,
                    'Billing Amount': item.billing_amount,
                    'TPS(GST)': match_item.tps,
                    'TVQ(QST)': match_item.tvq,
                    'Taxable Amount': item.billing_amount - (match_item.tps + match_item.tvq),
                    'Purpose': match_item.purpose,
                    'Category': match_item.category,
                    'Account': account,
                    'Project': match_item.project,
                    'Attendees:': match_item.attendees,
                    'Full Name': item.first_name.upper() + " " + item.last_name.upper(),
                }
                
                return_data.append(item_dict)
            
            return Response({'data': return_data})

        except Exception as e:
            return Response({ "message": f"error: {e}" })

class BankTransactionLists(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)
    def post(self, request):
        data = request.data

        trans_date_strings = [trans_date.strip() for trans_date in data.get('trans_date').split('\n') if trans_date != ""]
        post_date_strings = [post_date.strip() for post_date in data.get('post_date').split('\n') if post_date != ""]
        amt_strings = [amt.strip().replace(",", "") for amt in data.get('billing_amount').split('\n') if amt != ""]
        merchant_strings = [merchant.strip() for merchant in data.get('merchant_name').split('\n') if merchant != ""]
        first_name_strings = [first_name.strip() for first_name in data.get('first_name').split('\n') if first_name != ""]
        last_name_strings = [last_name.strip() for last_name in data.get('last_name').split('\n') if last_name != ""]

        try:
            if len(trans_date_strings) == len(post_date_strings) == len(amt_strings) == len(merchant_strings) == len(first_name_strings) == len(last_name_strings):
                for i in range(len(trans_date_strings)):
                    BankTransactionList.objects.create_transaction(
                    trans_date=datetime.strptime(trans_date_strings[i], "%m/%d/%y"),
                    post_date=datetime.strptime(post_date_strings[i], "%m/%d/%y"),
                    billing_amount=float(amt_strings[i]),
                    merchant_name=merchant_strings[i],
                    first_name=first_name_strings[i].upper(),
                    last_name=last_name_strings[i].upper(),
                )
                
                return Response({'message': "Successfully uploaded the information" }, status=status.HTTP_200_OK)
            else:
                raise RuntimeError("The provided number of data are different")

        except Exception as e:
            return Response({ "message": f"error: {e}" }, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        my_data = BankTransactionList.objects.all().values()
        data_list = list(my_data)
        
        return JsonResponse(data_list, safe=False)

class DeleteCardTransactions(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)
    def post(self, request):
        try:
            data = request.data
            
            for i in range(len(data)):
                trans_date = data[i]['original']['trans_date']
                billing_amount = data[i]['original']['billing_amount']
                merchant_name = data[i]['original']['merchant_name']
                category = data[i]['original']['category']
                purpose = data[i]['original']['purpose']
                first_name = data[i]['original']['first_name']
                last_name = data[i]['original']['last_name']

                rows = TaxTransactionForm.objects.filter(trans_date=trans_date, billing_amount=billing_amount, merchant_name=merchant_name, category=category, purpose=purpose, first_name=first_name, last_name=last_name)
                
                file_path = 'media/' + rows.values()[0]['img']
                if os.path.exists(file_path):
                    os.remove('media/' + rows.values()[0]['img'])
                    rows.delete()
                else:
                    raise RuntimeError("Unable to delete the data") 

            return Response({'message': "Successfully deleted provided data" }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({ "message": f"error: {e}" }, status=status.HTTP_400_BAD_REQUEST)

class DeleteBankTransactions(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)
    def post(self, request):
        try:
            data = request.data
            
            for i in range(len(data)):
                trans_date = data[i]['original']['trans_date']
                post_date = data[i]['original']['post_date']
                billing_amount = data[i]['original']['billing_amount']
                merchant_name = data[i]['original']['merchant_name']
                first_name = data[i]['original']['first_name']
                last_name = data[i]['original']['last_name']

                row = BankTransactionList.objects.filter(trans_date=trans_date, post_date=post_date, billing_amount=billing_amount, merchant_name=merchant_name, first_name=first_name, last_name=last_name).first()      
                
                if row:
                    row.delete()

            return Response({'message': "Successfully deleted provided data" }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({ "message": f"error: {e}" }, status=status.HTTP_400_BAD_REQUEST)

class DownloadReciptImages(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)
    def post(self, request):
        filenames = request.data.get('filenames')

        if not filenames:
            return JsonResponse({"error": "No filenames provided"}, status=status.HTTP_400_BAD_REQUEST)
         
        # Assuming you have a model where the filenames are stored
        files = TaxTransactionForm.objects.filter(img__in=filenames)

        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        temp_dir = os.path.join(settings.MEDIA_ROOT, f'temp_images_{current_time}')
        os.makedirs(temp_dir, exist_ok=True)

        for file in files:
            source_path = os.path.join(settings.MEDIA_ROOT, file.img.name)
            shutil.copy2(source_path, temp_dir)

        zip_file_path = shutil.make_archive(f'images_{current_time}', 'zip', temp_dir)

        # Open the zip file and read its content
        with open(zip_file_path, 'rb') as zip_file:
            zip_content = zip_file.read()

        # Return the zip file content as the response
        response = HttpResponse(zip_content, content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="images.zip"'

        os.remove(zip_file_path)
        shutil.rmtree(temp_dir)

        return response
        
class MyMissingTransactionLists(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)
    def get(self, request):
        serializer = UserSerializer(request.user)

        first_name = serializer.data['first_name']
        last_name = serializer.data['last_name']

        transactions = TaxTransactionForm.objects.filter(first_name=first_name.upper(), last_name=last_name.upper())
        bank_transactions = BankTransactionList.objects.filter(first_name=first_name.upper(), last_name=last_name.upper())
        
        transaction_dicts = [{'trans_date': obj.trans_date, 'billing_amount': obj.billing_amount, 'merchant_name': obj.merchant_name, 'category':obj.category, 'purpose': obj.purpose, 'first_name': obj.first_name, 'last_name': obj.last_name} for obj in transactions]
        bank_transactions_dicts = [{'trans_date': obj.trans_date, 'billing_amount': obj.billing_amount, 'first_name': obj.first_name, 'last_name': obj.last_name} for obj in bank_transactions]
        
        one_to_one_missing_element = []
        for transaction_element in transaction_dicts:
            compare_element = {'trans_date': transaction_element['trans_date'], 'billing_amount': transaction_element['billing_amount'],
                                'first_name': transaction_element['first_name'], 'last_name': transaction_element['last_name']}
            if compare_element in bank_transactions_dicts:
                bank_transactions_dicts.remove(compare_element)
            else:
                one_to_one_missing_element.append(transaction_element)

        return JsonResponse(one_to_one_missing_element, safe=False)
                    
class MyMissingBankTransactionLists(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)
    def get(self, request):
        serializer = UserSerializer(request.user)

        first_name = serializer.data['first_name']
        last_name = serializer.data['last_name']

        transactions = TaxTransactionForm.objects.filter(first_name=first_name.upper(), last_name=last_name.upper())
        bank_transactions = BankTransactionList.objects.filter(first_name=first_name.upper(), last_name=last_name.upper())
        
        transaction_dicts = [{'trans_date': obj.trans_date, 'billing_amount': obj.billing_amount, 'first_name': obj.first_name, 'last_name': obj.last_name} for obj in transactions]
        bank_transactions_dicts = [{'trans_date': obj.trans_date, 'post_date': obj.post_date, 'billing_amount': obj.billing_amount, 'merchant_name': obj.merchant_name, 'first_name': obj.first_name, 'last_name': obj.last_name} for obj in bank_transactions]
        
        one_to_one_missing_element = []
        for transaction_element in bank_transactions_dicts:
            compare_element = {'trans_date': transaction_element['trans_date'], 'billing_amount': transaction_element['billing_amount'],
                                'first_name': transaction_element['first_name'], 'last_name': transaction_element['last_name']}
            if compare_element in transaction_dicts:
                transaction_dicts.remove(compare_element)
            else:
                one_to_one_missing_element.append(transaction_element)

        return JsonResponse(one_to_one_missing_element, safe=False)
    
class MyMatchingTransactionLists(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)
    def get(self, request):
        serializer = UserSerializer(request.user)

        first_name = serializer.data['first_name']
        last_name = serializer.data['last_name']

        transactions = TaxTransactionForm.objects.filter(first_name=first_name.upper(), last_name=last_name.upper())
        bank_lists = BankTransactionList.objects.filter(first_name=first_name.upper(), last_name=last_name.upper())
        
        one_to_one_matching_elements = []

        if len(bank_lists) > len(transactions):
            bank_dicts = [{'trans_date': obj.trans_date, 'post_date': obj.post_date, 'billing_amount': obj.billing_amount, 'merchant_name': obj.merchant_name, 'first_name': obj.first_name, 'last_name': obj.last_name} for obj in bank_lists]
            transactions_dicts = [{'trans_date': obj.trans_date, 'billing_amount': obj.billing_amount, 'first_name': obj.first_name, 'last_name': obj.last_name} for obj in transactions]

            for bigger_element in bank_dicts:
                bigger_compare_element = {'trans_date': bigger_element['trans_date'], 'billing_amount': bigger_element['billing_amount'],
                'first_name': bigger_element['first_name'], 'last_name': bigger_element['last_name']}
                if bigger_compare_element in transactions_dicts:
                    one_to_one_matching_elements.append(bigger_element)
                    transactions_dicts.remove(bigger_compare_element)

        else:
            bank_dicts = [{'trans_date': obj.trans_date, 'billing_amount': obj.billing_amount, 'first_name': obj.first_name, 'last_name': obj.last_name} for obj in bank_lists]
            transactions_dicts = [{'trans_date': obj.trans_date, 'billing_amount': obj.billing_amount, 
                                   'merchant_name':obj.merchant_name, 'category': obj.category, 'purpose': obj.purpose,
                                    'first_name': obj.first_name, 'last_name': obj.last_name} for obj in transactions]

            for bigger_element in transactions_dicts:
                bigger_compare_element = {'trans_date': bigger_element['trans_date'], 'billing_amount': bigger_element['billing_amount'],
                'first_name': bigger_element['first_name'], 'last_name': bigger_element['last_name']}
                if bigger_compare_element in bank_dicts:
                    one_to_one_matching_elements.append(bigger_element)
                    bank_dicts.remove(bigger_compare_element)

        return JsonResponse(one_to_one_matching_elements, safe=False)
    
class FilterByDates(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)  

    def post(self, request):
        data = request.data

        date_from = datetime.strptime(data.get('date_from'), "%Y-%m-%d")
        date_to = datetime.strptime(data.get('date_to'), "%Y-%m-%d")
        first_name = data.get('first_name')
        last_name = data.get('last_name')

        filtered_data = TaxTransactionForm.objects.filter(first_name=first_name.upper(), last_name=last_name.upper(), trans_date__range=[date_from, date_to])

        my_data = list(filtered_data.values())

        return JsonResponse(my_data, safe=False, status=status.HTTP_200_OK)
    
class ForceMatch(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)  

    def post(self, request):
        try:
            data = request.data

            old_trans_date = datetime.strptime(data['user']['trans_date'], "%Y-%m-%d")
            new_trans_date = datetime.strptime(data['bank']['trans_date'], "%Y-%m-%d")
            first_name = data['user']['first_name']
            last_name = data['user']['last_name']
            billing_amount = data['user']['billing_amount']

            modify_data = TaxTransactionForm.objects.get(trans_date=old_trans_date, billing_amount=billing_amount, first_name=first_name.upper(), last_name=last_name.upper())
            modify_data.trans_date = new_trans_date
            modify_data.save()

            return Response({'message': 'Successfully Completed'}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'message': f'{e}'}, status=status.HTTP_204_NO_CONTENT)

class EditTransactionInformation(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)  

    def post(self, request):
        try:
            data = request.data
            
            original_data = data['original']

            original_trans_date = datetime.strptime(original_data.get('trans_date'), "%Y-%m-%d")
            original_billing_amount = original_data.get('billing_amount')
            original_merchant_name = original_data.get('merchant_name')
            original_tps = original_data.get('tps')
            original_tvq = original_data.get('tvq')
            original_first_name = original_data.get('first_name')
            original_last_name = original_data.get('last_name')

            edit_data = data['edit']

            new_trans_date = datetime.strptime(edit_data.get('trans_date'), "%Y-%m-%d")
            new_billing_amount = edit_data.get('billing_amount')
            new_category = edit_data.get('category')
            new_tps = edit_data.get('tps')
            new_tvq = edit_data.get('tvq')
            new_merchant_name = edit_data.get('merchant_name')
            new_project = edit_data.get('project')
            new_purpose = edit_data.get('purpose')
            new_attendees = edit_data.get('attendees')

            modify_data = TaxTransactionForm.objects.get(trans_date=original_trans_date, billing_amount=original_billing_amount, merchant_name=original_merchant_name,
                                                        tps=original_tps, tvq=original_tvq, first_name=original_first_name.upper(), last_name=original_last_name.upper())

            modify_data.trans_date = new_trans_date
            modify_data.billing_amount = new_billing_amount
            modify_data.category = new_category
            modify_data.tps = new_tps
            modify_data.tvq = new_tvq
            modify_data.merchant_name = new_merchant_name
            modify_data.project = new_project
            modify_data.purpose = new_purpose
            modify_data.attendees = new_attendees

            modify_data.save()

            my_data = TaxTransactionForm.objects.filter(first_name=original_first_name.upper(), last_name=original_last_name.upper())
            data_list = list(my_data.values())

            return JsonResponse(data_list, safe=False, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(e)
            return Response({'message': f'{e}'}, status=status.HTTP_204_NO_CONTENT)
        
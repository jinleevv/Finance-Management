from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model, login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer, ChangePasswordSerializer
from rest_framework import permissions, status
from .validations import custom_validation, validate_email, validate_password
from .models import TaxTransactionForm, BankTransactionList
from datetime import datetime
from django.http import HttpRequest, JsonResponse, HttpResponse
import pandas as pd
from django.conf import settings
import os

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
        department = data.get('department')
        constructions = ['Procurement', 'Contruction Operation']
        construction_options = ['12395202 Construction in progress_travel expenses', '12395213 Construction in progress_entertainment expenses', '12395201 Construction in progress_welfare expenses', '12395224 Construction in progress_conference expenses', '52216111 Bank charges']
        general_options = ['52202101 Travel', '52212102 Selling and administrative expenses_entertainment expenses_employees', '52201123 Selling and administrative expenses, welfare expenses, supporting discussion', '52224102 Selling and administrative expenses_conference expenses_employees', '52216111 Bank charges']
        try:
            transactions = TaxTransactionForm.objects.filter(trans_date__range=(date_from, date_to))
            bank_lists = BankTransactionList.objects.filter(trans_date__range=(date_from, date_to))

            transactions_set = set((obj.billing_amount, obj.trans_date, obj.first_name, obj.last_name) for obj in transactions)
            bank_lists_set = set((obj.billing_amount, obj.trans_date, obj.first_name, obj.last_name) for obj in bank_lists)

            common_elements = transactions_set.intersection(bank_lists_set)
            
            common_bank_lists = BankTransactionList.objects.filter(
                billing_amount__in=[amount for amount, date, first_name, last_name in common_elements],
                trans_date__in=[date for amount, date, first_name, last_name in common_elements],
                first_name__in = [first_name for amount, date, first_name, last_name in common_elements],
                last_name__in = [last_name for amount, date, first_name, last_name in common_elements],
            )

            common_transaction_lists = TaxTransactionForm.objects.filter(
                billing_amount__in=[amount for amount, date, first_name, last_name in common_elements],
                trans_date__in=[date for amount, date, first_name, last_name in common_elements],
                first_name__in = [first_name for amount, date, first_name, last_name in common_elements],
                last_name__in = [last_name for amount, date, first_name, last_name in common_elements],
            )

            common_data = []
            for obj1, obj2 in zip(common_transaction_lists, common_bank_lists):
                if department in constructions:
                    if obj1.category == 'Business Trip(Hotel,Food,Gas,Parking,Toll,Trasportation)':
                        account = construction_options[0]
                    elif obj1.category == 'Meeting with Business Partners':
                        account = construction_options[1]
                    elif obj1.category == 'Meeting between employees':
                        account = construction_options[2]
                    elif obj1.category == 'Business Conference, Seminar, Workshop':
                        account = construction_options[3]
                    elif obj1.category == 'Banking Fees':
                        account = construction_options[4]
                    else:
                        account = ""
                else:
                    if obj1.category == 'Business Trip(Hotel,Food,Gas,Parking,Toll,Trasportation)':
                        account = general_options[0]
                    elif obj1.category == 'Meeting with Business Partners':
                        account = general_options[1]
                    elif obj1.category == 'Meeting between employees':
                        account = general_options[2]
                    elif obj1.category == 'Business Conference, Seminar, Workshop':
                        account = general_options[3]
                    elif obj1.category == 'Banking Fees':
                        account = general_options[4]
                    else:
                        account = ""

                obj_dict = {
                    'Trans Date': obj1.trans_date,
                    'Post Date': obj2.post_date,
                    'Merchant Name': obj1.merchant_name,
                    'Billing Amount': obj1.billing_amount,
                    'TPS(GST)': obj1.tps,
                    'TVQ(QST)': obj1.tvq,
                    'Taxable Amount': obj1.billing_amount - (obj1.tps + obj1.tvq),
                    'Purpose': obj1.purpose,
                    'Category': obj1.category,
                    'Account': account,
                    'Project': obj1.project,
                    'Attendees:': obj1.attendees,
                    'Full Name': obj1.first_name + " " + obj1.last_name,
                }
                
                common_data.append(obj_dict)
            
            return Response({'data': common_data})

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
    def get(self, request, filename):
        file_path = os.path.join(settings.MEDIA_ROOT, "uploads/" , filename)

        if os.path.exists(file_path):
            with open(file_path, 'rb') as file:
                response = HttpResponse(file.read(), content_type='application/octet-stream')
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        else:
            # If file does not exist, return a 400 bad request status
            return HttpResponse('File not found', status=status.HTTP_400_BAD_REQUEST)
        
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

            modify_data = TaxTransactionForm.objects.get(trans_date=old_trans_date, first_name=first_name.upper(), last_name=last_name.upper())
            modify_data.trans_date = new_trans_date
            modify_data.save()

            return Response({'message': 'Successfully Completed'}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'message': 'Failed To Force Match'}, status=status.HTTP_204_NO_CONTENT)

        
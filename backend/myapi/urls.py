from django.urls import path
from . import views

urlpatterns = [
    path('sessionid-exist/', views.SessionStatus.as_view(), name='session-status'),
    path('update-password/', views.UpdatePassword.as_view(), name='update-password'),
    path('register/', views.UserRegister.as_view(), name='register'),
    path('login/', views.UserLogin.as_view(), name='login'),
    path('logout/', views.UserLogout.as_view(), name='logout'),
    path('user/', views.UserView.as_view(), name='user'),
    path('card-transaction-upload/', views.CardTransactionUpload.as_view(), name='card-transaction-upload'),
    path('card-transaction-history/', views.CardTransactionHistory.as_view(), name='card-transaction-history'),
    path('download-transaction/', views.DownloadTransactions.as_view(), name='download-tax-info'),
    path('upload-bank-transaction-list/', views.BankTransactionLists.as_view(), name='upload-bank-transaction-lists'),
    path('delete-card-data/', views.DeleteCardTransactions.as_view(), name='delete-card-data'),
    path('delete-bank-data/', views.DeleteBankTransactions.as_view(), name='delete-bank-data'),
    path('download/uploads/<str:filename>/', views.DownloadReciptImages.as_view(), name='download_file'),
    path('missing-transaction-lists/', views.MyMissingTransactionLists.as_view(), name='my-missing-transaction-lists'),
    path('missing-bank-transaction-lists/', views.MyMissingBankTransactionLists.as_view(), name='my-missing-bank-transaction-lists'),
    path('matching-transaction-lists/', views.MyMatchingTransactionLists.as_view(), name='my-missing-bank-transaction-lists'),
]
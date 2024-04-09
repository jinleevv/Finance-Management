from django.contrib import admin
# Register your models here.

from .models import AppUser
from .models import TaxTransactionForm
from .models import BankTransactionList

admin.site.register(AppUser)
admin.site.register(TaxTransactionForm)
admin.site.register(BankTransactionList)
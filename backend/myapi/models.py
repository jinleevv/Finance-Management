from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager

#Create your models here.

class AppUserManager(BaseUserManager):
    def create_user(self, email, first_name="", last_name="", department="", password=None):
        if not email:
            raise ValueError('An email is required.')
        if not password:
            raise ValueError('A password is required.')
        if not first_name:
            raise ValueError('First name is required')
        if not last_name:
            raise ValueError('Last name is required')
        if not department:
            raise ValueError('Department is required')
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name, last_name=last_name, department=department)
        user.set_password(password)
        user.save()
        return user
    def create_superuser(self, email, password):
        if not email:
            raise ValueError('An email is required.')
        if not password:
            raise ValueError('A password is required.')
        user = self.create_user(email, "", "", password)
        user.is_superuser = True
        user.save()
        return user

class AppUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50, default='')
    last_name = models.CharField(max_length=50, default='')
    department = models.CharField(max_length=50, default='')

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = AppUserManager()

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.email
    
    @property
    def is_staff(self):
        return self.is_superuser


class TaxTransactionFormManager(models.Manager):
    def create_transaction(self, trans_date, billing_amount, tps, tvq, merchant_name, category, purpose, img, full_name, project, attendees):
        transaction = self.create(trans_date=trans_date, billing_amount=billing_amount, tps=tps, tvq=tvq,
                                merchant_name=merchant_name, category=category, purpose=purpose,img=img,
                                full_name=full_name, project=project, attendees=attendees)

        return transaction

class TaxTransactionForm(models.Model):
    trans_date = models.DateField()
    billing_amount = models.FloatField(default=0.0)
    tps = models.FloatField(default=0.0)
    tvq = models.FloatField(default=0.0)
    merchant_name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    purpose = models.CharField(max_length=1000)
    img = models.ImageField(upload_to="uploads/", null=True, blank=True)
    full_name = models.CharField(max_length=100, default="")
    project = models.CharField(max_length=50, default="")
    attendees = models.CharField(max_length=100, default="")

    objects = TaxTransactionFormManager()

    @classmethod
    def create(cls, trans_date, billing_amount, tps, tvq, merchant_name, category, purpose, img, full_name, project, attendees):
        transaction = cls(trans_date=trans_date, billing_amount=billing_amount, tps=tps, tvq=tvq,
                        merchant_name=merchant_name, category=category, purpose=purpose,img=img,
                        full_name=full_name, project=project, attendees=attendees)
        return transaction

    class Meta:
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'

class BankTransactionListManager(models.Manager):
    def create_transaction(self, trans_date, post_date, billing_amount, merchant_name, first_name, last_name):
        transaction = self.create(trans_date=trans_date, post_date=post_date, billing_amount=billing_amount, merchant_name=merchant_name, first_name=first_name, last_name=last_name)

        return transaction

class BankTransactionList(models.Model):
    trans_date = models.DateField()
    post_date = models.DateField()
    billing_amount = models.FloatField()
    merchant_name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)

    objects = BankTransactionListManager()

    @classmethod
    def create(cls, trans_date, post_date, billing_amount, merchant_name, first_name, last_name):
        transaction = cls(trans_date=trans_date, post_date=post_date, billing_amount=billing_amount, merchant_name=merchant_name, first_name=first_name, last_name=last_name)
        return transaction

    class Meta:
        verbose_name = 'Transaction'
        verbose_name_plural = 'Bank Lists'
    


    
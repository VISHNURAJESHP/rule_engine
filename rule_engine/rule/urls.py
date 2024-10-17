from django.urls import path
from .views import create_rule, evaluate_rule, combine_rule, get_rules

urlpatterns = [
    path('create_rule/', create_rule, name='create_rule'),
    path('evaluate_rule/', evaluate_rule, name='evaluate_rule'),
    path('combine_rules/', combine_rule, name='combine_rules'),
    path('get_rules/', get_rules, name='get_rules'), 
]
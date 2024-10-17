from django.db import models

class Node:
    def __init__(self, type, left=None, right=None, value=None):
        self.type = type  
        self.left = left  
        self.right = right  
        self.value = value  
    
    def __repr__(self):
        if self.type == 'operand':
            return f"Operand({self.value})"
        return f"Operator({self.type}, left={self.left}, right={self.right})"

class Rule(models.Model):
    rule_string =models.TextField()
    ast_representation = models.TextField()

    def __str__(self):
        return self.rule_string

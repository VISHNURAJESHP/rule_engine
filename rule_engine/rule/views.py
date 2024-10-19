import json
import re
import ast
from django.http import JsonResponse
from .models import Rule, Node
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt


def get_rules(request):
    if request.method == 'GET':
        rules = Rule.objects.values('id', 'rule_string')  # Fetch the id and rule_string from the database
        return JsonResponse(list(rules), safe=False)

# Tokenize rule into components (identifying operators and operands)
def tokenize_rule(rule_string):
    tokens = re.findall(r'(\w+|[><=!]+|AND|OR|\(|\))', rule_string)
    return tokens

# Build AST recursively from tokens
def parse_tokens(tokens):
    if not tokens:
        return None

    # Handle parentheses and binary operations
    def parse_expression(index):
        node_stack = []
        operator_stack = []

        while index < len(tokens):
            token = tokens[index]

            if token == '(':
                subtree, index = parse_expression(index + 1)
                node_stack.append(subtree)

            elif token == ')':
                break

            elif token == 'AND' or token == 'OR':
                operator_stack.append(token)

            elif re.match(r'\w+', token):
                # Operand (like age, salary, etc.)
                if re.match(r'\w+', tokens[index + 1]):  # It's an operand with comparison
                    operand = Node(type='operand', value=f"{tokens[index]} {tokens[index + 1]} {tokens[index + 2]}")
                    node_stack.append(operand)
                    index += 2  # Skip past the comparison

            index += 1

        # Combine the nodes based on operators
        while operator_stack:
            right_node = node_stack.pop()
            left_node = node_stack.pop()
            operator = operator_stack.pop()
            node_stack.append(Node(type=operator, left=left_node, right=right_node))

        return node_stack[0], index

    return parse_expression(0)[0]


@csrf_exempt
def create_rule(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        rule_string = data.get('rule_string')

        if not rule_string:
            return JsonResponse({'error': 'Rule string is required'}, status=400)
        
        tokens = tokenize_rule(rule_string)
        ast_root = parse_tokens(tokens)

        ast_representation = str(ast_root)
        rule = Rule.objects.create(rule_string=rule_string, ast_representation=ast_representation)

        # Create a function to serialize the Node object into a dictionary for JSON output
        def serialize_node(node):
            if node is None:
                return None
            return {
                'type': node.type,
                'value': node.value,
                'left': serialize_node(node.left),
                'right': serialize_node(node.right)
            }

        # Serialize the AST root Node
        serialized_ast = serialize_node(ast_root)

        return JsonResponse({
            'rule_id': rule.id,
            'ast': ast_representation,
            'node': serialized_ast
        }, status=201)
            

# Function to delete a rule
@csrf_exempt
def delete_rule(request):
    if request.method == "POST":
        data = json.loads(request.body)
        rule_id = data.get('rule_id')
        try:
            rule = Rule.objects.get(id=rule_id)
            rule.delete()
            return JsonResponse({'message': 'Rule deleted successfully!'})
        except Rule.DoesNotExist:
            return JsonResponse({'error': 'Rule not found.'}, status=404)

@csrf_exempt
def combine_rule(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        rule_ids = data.get('rule_ids',[])

        if len(rule_ids)<2:
            return JsonResponse({'error':'Atleast two rule is needed'},status=400)
        
        rules = Rule.objects.filter(id__in=rule_ids)


        if len(rules) != len(rule_ids):
            return JsonResponse({'error': 'Invalid rule IDs provided'}, status=400)

        combined_rule = ' AND '.join([f'({rule.rule_string})' for rule in rules])

        tokens = tokenize_rule(combined_rule)
        ast_root = parse_tokens(tokens)
        ast_representation = str(ast_root)
        combined_rule_obj = Rule.objects.create(rule_string=combined_rule, ast_representation=ast_representation)

        return JsonResponse({'combined_rule_id': combined_rule_obj.id, 'ast': ast_representation}, status=201)
    
@csrf_exempt
def evaluate_rule(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        rule_id = data.get('rule_id')
        user_data = data.get('user_data', {})

        try:
            # Retrieve the rule from the database
            rule = Rule.objects.get(id=rule_id)
            print(f"Retrieved rule: {rule.rule_string}")
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'Rule not found'}, status=404)

        try:
            # Prepare the rule string for evaluation
            rule_expression = rule.rule_string \
                .replace("AND", "and") \
                .replace("OR", "or") \
                .replace("=", "==")  # Ensure we use the correct equality operator

            # Print the transformed rule expression for debugging
            print(f"Transformed rule expression: {rule_expression}")

            # Check if there are any unmatched quotes in the rule expression
            if "'" in rule_expression or '"' in rule_expression:
                print(f"Rule expression contains quotes: {rule_expression}")

            # Safely evaluate the expression against user data
            result = eval(rule_expression, {}, user_data)

            # Ensure that the result is a boolean
            return JsonResponse({'result': bool(result)}, status=200)

        except SyntaxError as e:
            return JsonResponse({'error': f'Syntax error in rule: {str(e)}'}, status=400)
        except NameError as e:
            return JsonResponse({'error': f'Name error in rule: {str(e)}'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Error evaluating rule: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
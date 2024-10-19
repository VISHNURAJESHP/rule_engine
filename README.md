<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>README - Rule Engine Application</title>
</head>
<body>

<h1>Rule Engine Application</h1>

<p>This application is designed to determine user eligibility based on various attributes such as age, department, income, and spending. It employs an Abstract Syntax Tree (AST) to represent conditional rules, allowing for dynamic creation, combination, and modification of these rules.</p>

<h2>Objective</h2>
<p>Develop a simple 3-tier rule engine application (UI, API, and Backend) to determine user eligibility based on attributes like age, department, income, and spending. The system utilizes an AST to represent conditional rules.</p>

<h2>Data Structure</h2>
<p>The application defines a data structure to represent the AST:</p>
<ul>
    <li><strong>Node Structure:</strong>
        <ul>
            <li><strong>type:</strong> String indicating the node type ("operator" for AND/OR, "operand" for conditions).</li>
            <li><strong>left:</strong> Reference to another Node (left child).</li>
            <li><strong>right:</strong> Reference to another Node (right child for operators).</li>
            <li><strong>value:</strong> Optional value for operand nodes (e.g., number for comparisons).</li>
        </ul>
    </li>
</ul>

<h2>Data Storage</h2>
<p>The application uses a relational database (e.g., PostgreSQL or SQLite) for storing rules and application metadata.</p>
<p>The schema includes tables for:</p>
<ul>
    <li><strong>Rules:</strong> To store the defined rules and their AST representations.</li>
    <li><strong>Metadata:</strong> To store application-related metadata such as user preferences and configuration settings.</li>
</ul>

<h2>API Endpoints</h2>
<p>The following API endpoints are available:</p>

<ul>
    <li>
        <strong>Create Rule:</strong><br>
        <code>POST /create_rule/</code><br>
        This endpoint allows users to create new rules.
    </li>
    <li>
        <strong>Evaluate Rule:</strong><br>
        <code>POST /evaluate_rule/</code><br>
        This endpoint evaluates a rule against provided user data.
    </li>
    <li>
        <strong>Combine Rules:</strong><br>
        <code>POST /combine_rules/</code><br>
        This endpoint allows for the combination of two or more rules.
    </li>
    <li>
        <strong>Get Rules:</strong><br>
        <code>GET /get_rules/</code><br>
        This endpoint retrieves a list of existing rules.
    </li>
    <li>
        <strong>Delete Rule:</strong><br>
        <code>POST /delete_rule/</code><br>
        This endpoint allows users to delete a specified rule.
    </li>
</ul>

<h2>Project Setup</h2>
<ol>
    <li>Clone the repository: <code>git clone https://github.com/VISHNURAJESHP/rule_engine.git</code></li>
    <li>Install dependencies: <code>pip install -r requirements.txt</code></li>
    <li>Run database migrations: <code>python manage.py migrate</code></li>
    <li>Start the Django development server: <code>python manage.py runserver</code></li>
</ol>

<h2>Run Frontend</h2>
<ol>
    <li>Navigate to the <code>web</code> folder: <code>cd web</code></li>
    <li>Start the frontend server: <code>python -m http.server 8080</code></li>
    <li>Access the dashboard at: <code>http://localhost:8080/index.html</code></li>
</ol>

<h2>Screenshots</h2>
<p>Below are some screenshots of the project in action:</p>
<!-- Add screenshots as necessary -->
<h3>1. Home Page</h3>
<img src="rule_engine/images/Screenshot (126).png" alt="Home Page Screenshot" width="600">

<h3>2. Rule Creation and AST</h3>
<img src="rule_engine/images/Screenshot (127).png" alt="Rule Creation and AST Screenshot" width="600">

<h3>3. Rule Combine</h3>
<img src="rule_engine/images/Screenshot (128).png" alt="Rule Combine Screenshot" width="600">

<h3>4. Rule Deletion</h3>
<img src="rule_engine/images/Screenshot (133).png" alt="Rule Deletion Screenshot" width="600">

<h3>5. Rule Evaluation</h3>
<img src="rule_engine/images/Screenshot (131).png" alt="Rule Evaluation Screenshot" width="600">
<img src="rule_engine/images/Screenshot (132).png" alt="Rule Evaluation Screenshot" width="600">

<h2>License</h2>
<p>This project is licensed under the MIT License.</p>

</body>
</html>

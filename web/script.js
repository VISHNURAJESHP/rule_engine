let rules = []; // Global variable to store the rules
let ruleToModifyIndex = null; // To track which rule is being modified

// Function to fetch rules from the backend
function fetchRules() {
    fetch("http://localhost:8000/get_rules/")
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            rules = data; // Store fetched rules
            populateRuleDropdowns(); // Populate dropdowns with fetched rules
            updateRuleList(); // Update rule list
        })
        .catch((error) => {
            console.error('Error fetching rules:', error);
        });
}

// Call fetchRules when the page loads
document.addEventListener('DOMContentLoaded', fetchRules);

// Function to create a rule and add to the list
function createRule() {
    const rule = document.getElementById("rule").value;
    if (!rule) {
        alert("Please enter a rule.");
        return;
    }

    fetch("http://localhost:8000/create_rule/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ rule_string: rule }),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        alert(`Rule created with ID: ${data.rule_id}`);
        
        // Display the AST and node structure
        console.log("AST Representation:", data.ast);
        console.log("Serialized Node:", JSON.stringify(data.node, null, 2));
        
        // Optional: Display in the UI (for example, using a modal or div)
        document.getElementById("output").innerHTML = `
            <p><strong>Rule ID:</strong> ${data.rule_id}</p>
            <p><strong>AST:</strong> ${data.ast}</p>
            <pre><strong>Node:</strong> ${JSON.stringify(data.node, null, 2)}</pre>
        `;
        
        // Update the rules list
        rules.push({ id: data.rule_id, rule_string: rule });
        updateRuleList();
        populateRuleDropdowns();  // Update dropdowns after creating a rule
        document.getElementById("rule").value = ""; // Clear input field after creation
    })
    .catch((error) => {
        alert(`Error: ${error.message}`);
    });
}


// Function to display the rules in the list for editing
function updateRuleList() {
    const ruleList = document.getElementById("rules-list");
    ruleList.innerHTML = ""; // Clear existing rules

    rules.forEach((ruleObj, index) => {
        const li = document.createElement("li");
        li.innerHTML = `Rule ${index + 1}: ${ruleObj.rule_string} 
                        <button onclick="modifyRule(${index})">Modify</button>
                        <button onclick="deleteRule(${index})">Delete</button>`;
        ruleList.appendChild(li);
    });
}

// Function to open the edit rules section
function showEditRules() {
    window.location.reload(); // Refresh the page to get the latest rules
    setTimeout(fetchRules, 100);  // Reuse fetchRules to get the latest rules
    document.getElementById("editRulesSection").style.display = "block"; // Show rule edit section
}

// Function to populate the dropdowns with rules
function populateRuleDropdowns() {
    const ruleSelects = document.querySelectorAll("select[id^='rule']");

    ruleSelects.forEach(select => {
        // Clear existing options
        select.innerHTML = '<option value="">Select a rule</option>';
        
        // Populate with options
        rules.forEach(rule => {
            const option = document.createElement("option");
            option.value = rule.id;  // Set the rule ID as the value
            option.textContent = `Rule ID: ${rule.id} - ${rule.rule_string}`;  // Display text
            select.appendChild(option);
        });
    });
}

// Function to open the edit rule modal
function modifyRule(index) {
    ruleToModifyIndex = index;
    const rule = rules[index].rule_string;
    document.getElementById("ruleExpression").value = rule;
    document.getElementById("modifyModal").style.display = "block"; // Show modal
}

// Function to save the modified rule
function saveModifiedRule() {
    const newRule = document.getElementById("ruleExpression").value;
    const ruleId = rules[ruleToModifyIndex].id;

    fetch("http://localhost:8000/modify_rule/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ rule_id: ruleId, new_rule: newRule }),
    })
    .then((response) => response.json())
    .then((data) => {
        alert("Rule updated successfully!");
        rules[ruleToModifyIndex].rule_string = newRule;  // Update the rule locally
        updateRuleList();
        populateRuleDropdowns(); // Update dropdowns after modification
        closeModifyModal();
    });
}

// Function to close the modify rule modal
function closeModifyModal() {
    document.getElementById("modifyModal").style.display = "none"; // Hide modal
}

// Function to delete a rule from the list
function deleteRule(index) {
    const ruleId = rules[index].id;
    fetch("http://localhost:8000/delete_rule/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ rule_id: ruleId }),
    })
    .then((response) => response.json())
    .then(() => {
        rules.splice(index, 1);
        updateRuleList();
        populateRuleDropdowns(); // Update dropdowns after deletion
    });
}

// Function to combine rules
function combineRules() {
    const rule1Id = document.getElementById("rule1").value;
    const rule2Id = document.getElementById("rule2").value;

    // Check if both rules are selected
    if (!rule1Id || !rule2Id) {
        alert("You need to select two rules to combine.");
        return;
    }

    fetch("http://localhost:8000/combine_rules/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ rule_ids: [rule1Id, rule2Id] }), // Send selected rule IDs
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then((data) => {
        alert(`Rules combined into rule ID: ${data.combined_rule_id}`);
        rules.push({ id: data.combined_rule_id, rule_string: 'Combined Rule' });
        populateRuleDropdowns();  // Update dropdown options
        updateRuleList(); // Update the rule list

        window.location.reload();
    })
    .catch((error) => {
        console.error('Error combining rules:', error);
    });
}

// Function to evaluate the selected rule
function evaluateRule() {
    const data = JSON.parse(document.getElementById("data").value);
    const ruleId = document.getElementById("ruleSelect").value;

    if (!ruleId) {
        alert("Please select a rule to evaluate.");
        return;
    }

    fetch("http://localhost:8000/evaluate_rule/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ rule_id: ruleId, user_data: data }),
    })
    .then((response) => response.json())
    .then((result) => {
        if (result.error) {
            document.getElementById("result").innerText = `Error: ${result.error}`;
        } else {
            document.getElementById("result").innerText = `Result: ${result.result}`;
        }
    })
    .catch((error) => {
        console.error('Error evaluating rule:', error);
        document.getElementById("result").innerText = `Error: ${error.message}`;
    });
}

// Function to update the rule dropdown and enable/disable the combine button
function updateSelectedRules() {
    const rule1 = document.getElementById("rule1").value;
    const rule2 = document.getElementById("rule2").value;

    const combineButton = document.getElementById("combineButton");
    if (rule1 && rule2) {
        combineButton.disabled = false; // Enable button if both rules are selected
    } else {
        combineButton.disabled = true; // Disable button if either is not selected
    }
}

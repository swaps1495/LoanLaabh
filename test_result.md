#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  LoanLaabh - Indian loan eligibility & lender matching platform (DSA marketplace).
  v2: Optimized for LEAD CONVERSION & PRE-QUALIFICATION (not lender comparison).
  - 7-step customer form (Basic, Residence, Employment, Income+FOIR, Loan, Credit, Consent)
  - Rule-based screening engine + GPT-4o AI analysis (lead score, approval probability, eligible amount, risk flags, sales priority, internal notes)
  - Customer result page HIDES lender names. Shows pre-qualification, eligible amount, approval chances, WhatsApp CTA
  - Admin dashboard with filters (status/loan type/city/priority/date), CSV export, lead status workflow
  - Lender Criteria Manager (/admin/lenders) with full CRUD
  - Supabase (Postgres) for persistence, admin password auth

backend:
  - task: "Lead submission with screening + AI analysis"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    needs_retesting: true
  - task: "Admin lead listing with filters"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    needs_retesting: true
  - task: "Lender Criteria CRUD"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    needs_retesting: true
  - task: "Admin authentication (password)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    needs_retesting: false

frontend:
  - task: "Landing page + 7-step form"
    implemented: true
    working: true
    file: "app/page.js"
    needs_retesting: false
  - task: "Customer result page (no lender names)"
    implemented: true
    working: "NA"
    file: "app/page.js"
    needs_retesting: true
  - task: "Admin dashboard with filters + CSV export"
    implemented: true
    working: "NA"
    file: "app/admin/page.js"
    needs_retesting: true
  - task: "Lender Criteria Manager UI"
    implemented: true
    working: "NA"
    file: "app/admin/lenders/page.js"
    needs_retesting: true

metadata:
  created_by: "main_agent"
  version: "2.0"

agent_communication:
  - agent: "main"
    message: "v2 MVP built. Awaiting Supabase credentials from user to test end-to-end. AI analysis uses Emergent LLM key with rule-based fallback."

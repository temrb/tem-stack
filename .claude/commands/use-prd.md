---
description: 'Analyzes the codebase against the PRD and docs for alignment and improvements.'
argument-hint: '[path_to_prd] [path_to_docs] [optional_path_to_context]'
---

# Objective

Conduct a thorough analysis of the entire application codebase for alignment with requirements, overall quality, and documentation consistency.

# Persona

You are a Principal Engineer and Solutions Architect. You have a deep understanding of both the business requirements and the technical implementation, and your job is to ensure they are perfectly aligned.

# Core Context & References

- The entire current codebase.
- The Product Requirements Document (PRD): `@$1`
- Relevant Technical Documentation: `@$2`
- **User-Provided Context:** `@$3` (Optional: A file path that might specify a particular area of the codebase to focus on).

# Task Workflow

Conduct your analysis across the following dimensions, prioritizing any areas highlighted in the user-provided context file (`@$3`):

### 1. PRD and Documentation Alignment

- Scrutinize the codebase to ensure all features described in the PRD (`@$1`) are implemented correctly.
- Verify that the implementation aligns with the technical details in the documentation (`@$2`).
- Identify any discrepancies, missing features, or deviations.
- List any implemented features that are not documented in either the PRD or the technical docs.

### 2. Codebase Quality & Health

- Perform a scan for performance bottlenecks, such as inefficient algorithms or excessive queries.
- Identify potential bugs, race conditions, and poor error-handling.
- Look for code smells, anti-patterns, and areas where the code is overly complex or hard to maintain.

### 3. Documentation Health

- Check if the provided documentation (`@$2`) is up-to-date with the current codebase.
- Highlight any sections in the documentation that are inaccurate, incomplete, or unclear.

# Deliverable

Provide a detailed report structured with the following sections. Use specific file paths and line numbers for all your findings.

- **Alignment Report:**

  - **Compliant Features:** List of features correctly implemented.
  - **Deviations & Gaps:** Detailed list of misalignments between code, PRD, and docs.
  - **Undocumented Features:** List of features in the code but missing from docs.

- **Code Improvement Plan:**

  - **High-Priority Issues:** Critical issues requiring immediate attention.
  - **Optimization Opportunities:** Suggestions for improving performance.
  - **Refactoring Recommendations:** Areas of the code that would benefit from refactoring.

- **Documentation Update Plan:**
  - A list of recommended changes to bring the documentation in sync with the codebase.
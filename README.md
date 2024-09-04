# Project Management as Code
Utility aims to make git repository single source of truth for planning, minimize daily routine and split PM activities between team members.
It will scan you repository for specfic files and marked comments section to extract hierarchy of tasks.
Usually `.todo` files can be used to define PM artifacts, but tasks description can be placed to any file in repository.

# DSL
  Comments section can have three sections using Yaml format: team, deadlines & tasks.
  Here is example for `.todo` file at repository root
  ```
  /* TPM

  team:
    "vlad.k":
      email: "vk@moonnoon.net"
    "artem.y":
      email: "ay@moonnoon.net"

  timeline:
    "v24.9.0":
      date: "2024-09-30"
    "v24.10.0":
      date: "2024-10-31"

  tasks: |
    [!:003:v24.9.0] Deploy UAT environment @vlad.k
    [:002:v24.9.0] Test payment processor: embedded & external checkout form @artem.y
    [>:001:v24.9.0] Restore CI/CD @vlad.k

  */
  ```

## Statuses & attributes
  * First symbol in square brackets describe status
    | Symbol | Meaning         |
    | ---    | ---             |
    |        | todo            |
    | >      | in progress     |
    | +      | done            |
    | -      | dropped         |
    | ?      | to be discussed |
    | !      | blocked         |
  * Optionally, after colon, task can have identifier (may be used to reference this task from other components)
  * Plus, deadline can be specified after second colon 

## Mentionings, Tags, Links
  * @alem.m - will bibd Alex with specfic task
  * #backend - will add backend tag to the task
  * \<link\> - will create link with some other task or external resource 
  

## Command line options
General format
```
tpm [ls] [parameters] [optios]
```
| Command  | Parameter  | Option  | Description | Example |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| ls |  |  |  |  |

  
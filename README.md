# Project Management as Code - TPM
The goal of the utility is to make the git repository the single source of truth for project planning and execution, minimize daily routine, and extend project management activities beyond one person.

It scans your repository for specific files and marked comment sections to get hierarchy of tasks, statuses, assignments & timeline.

Based on history of commits, TPM can provide up to date project's statistic like average tasks development time, blocked status resolution timeout etc.

One of the main USP is to provide estimates based on development speed captures in repository commits.

## DSL
  
Typically `.todo` files are used to define PM artifacts, but description of tasks can be placed into any file in the repository.

Here is example for `.todo` file at repository root
  ```
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
    [!:004:v24.9.0] Deploy UAT environment @vlad.k
    [>:003:v24.9.0] Configure SES @vlad.k
    [>:002:v24.9.0] Test payment processor: embedded & external checkout form @artem.y
    [+:001:v24.9.0] Restore CI/CD @vlad.k
      [+] Attach tln-cicd-git subtree
      [+] Configure envariment variables, tweak root .tln.conf
  ```

## Statuses & attributes
  * First symbol in square brackets describes status of the task
    | Symbol | Meaning         |
    | ---    | ---             |
    | -      | todo            |
    | >      | in progress     |
    | ?      | to be discussed |
    | !      | blocked         |
    | +      | done            |
    | x      | dropped         |
  * Optionally, after colon, task can have identifier (may be used to reference this task from other components)
  * Plus, optionally, deadline can be specified after second colon 

## Mentionings, Tags, Links
  * @alex.m - will bind Alex with specfic task
  * #backend - will add `backend` tag to the task
  * \<docs/srs/multi-tenancy.md\> - will create link with some other task, internal document or external resource 

## Command line options
General format
```
tpm [ls] [parameters] [optios]
```
| Command (parameters & options)  | Default | Description |
| ------------- | ------------- | ------------- |
| tpm ls | | Display list of tasks for current git user |
| tpm config --team --timeline | | Generate example .todo file at current directory |
| tpm ls --backlog | false | Display list of tasks for current git user are waiting for completion |
| tpm ls --indev | true | Display list of tasks for current git user in development |
| tpm ls --done | true | Display list of tasks for current git user which were aleady completed |
| tpm ls --tasks | true | Display tasks |
| tpm ls --team | false | Display team structure |
| tpm ls --timeline | false | Display project timeline |
| tpm ls --srs | false | Display project timeline |
| tpm ls -g vlad.k | git user |  Display tasks assigned to specific user |
| tpm ls -a | false | Display tasks for all users |
| tpm ls -t backend | | Display tasks with 'backend' tag |
| tpm ls -s cognito | | Display tasks with 'cognito' strung in title |

  

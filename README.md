# Project Management as Code - TPM
The goal of the utility is to make the git repository the single source of truth for project planning and execution, minimize daily routine, and extend project management activities beyond one person.

It scans your repository for specific file(.tpm) get hierarchy of tasks, statuses, assignments, timeline, srs & project description.

Based on history of commits, TPM can provide up to date project's statistic like average tasks development time, blocked status resolution timeout etc.

One of the main USP is to provide estimates based on development speed captures from repository commits.

## Quick start

* Install tpm
  ```
  npm i -g tln-pm@0.13.0
  ```
* Goto you project git repository root folder and create initial config
  ```
  tpm config --project --team --timeline --tasks
  ```
* Update **.tpm.yml** with project information, team structure, timeline and tasks
  ```
  project:
    id: myproject
    name: My Project
    description: My project description
  team:
    alice.c:
      email: alice.c@gmail.com
      name: Alice Clarke
      fte: 1
  timeline:
    v24.12.0:
      deadline: '2024-12-31T18:00:00.000Z'
  tasks: |
    [-:002:v24.12.0] Integrate auth library @alice.c
      [!] Add /iam/auth endpoint
      [?] Configure auth callbacks
    [>:001:v24.12.0] Create project structure @alice.c
  ```

## Task statuses & attributes
  * Task can be described in multiple forms depends on requirements
    | Example  | Description |
    | ------------- | ------------- |
    | [-] Simple task with description only | This format is useful for subtasks |
    | [-:001] Task with Id | Top level task but without delivery version |
    | [-:010:v24.12.0] Task with delivery version | This format should be used for top level task with specific deadline |
  
  * First symbol in square brackets describes status of the task
    | Symbol | Meaning         |
    | ---    | ---             |
    | -      | todo            |
    | >      | in development  |
    | ?      | to be discussed |
    | !      | blocked         |
    | +      | done            |
    | x      | dropped         |
  * Optionally, after colon, task can have identifier (may be used to reference this task from other components)
  * Plus, optionally, deadline can be specified after second colon 

## Mentionings, Tags, Links
  * @alex.m - will bind Alex with specfic task
  * #backend - will add `backend` tag to the task
  * (\<docs/srs/multi-tenancy.md\>) - will create link with some other task, internal document or external resource 

## Command line options
General format
```
tpm [ls | config] [component] [id] [optios]
```
| Command (parameters & options)  | Default | Description |
| ------------- | ------------- | ------------- |
| tpm ls | | Display list of tasks for current git user |
| tpm config --project --team --timeline --tasks --srs --components | | Generate example .tpm.yml |
| tpm ls --backlog | false | Display list of tasks for current git user are waiting for completion |
| tpm ls --todo | false | Display list of tasks for current git user in development |
| tpm ls --dev | true | Display list of tasks for current git user in development |
| tpm ls --done | true | Display list of tasks for current git user which were aleady completed |
| tpm ls -g alice.c | git user |  Display tasks in developmenr were assigned to the specific user |
| tpm ls -a | false | Display tasks are in development for all users |
| tpm ls -t backend | | Display tasks with 'backend' tag |
| tpm ls -s cognito | | Display tasks with 'cognito' string in title |

## DSL
```
project:
  id: myproject
  name: My Project
  description: My project description
team:
  alice.c:
    email: alice.c@gmail.com
    name: Alice Clarke
    fte: 1
timeline:
  v24.12.0:
    deadline: '2024-12-31T18:00:00.000Z'
tasks: |
  [-:003] Add CI/CD skeleton (srs/cicd)
  [-:002:v24.12.0] Integrate auth library @alice.c
    [!] Add /iam/auth endpoint
    [?] Configure auth callbacks
  [>:001:v24.12.0] Create project structure @alice.c
srs:
  cicd: |-
    Skeleton should implement four main scenarios: pr build, push build, nightly build, dispamch run.
    All steps should be implemented in a single yaml file (base.yml).
    Every scenario should be implemented as a separate yaml file and should use parameters to define which step needs to be run.
components:
  backend:
    tasks: |
      [-:002] Integrate Sonarcloud
      [+:001] Add service skeleton + unit tests
  web:
    tasks: |
      [-:002] Integrate Sonarcloud
      [>:001] Add landing skeleton using Next.js
```  

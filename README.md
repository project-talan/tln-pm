# Project Management as Code
The tool, **tpm**, tackles several challenges faced in modern software development:
  * Development and project management tools are often housed in separate systems like GitHub and Jira. This separation can result in wasted development resources due to the need for continuous synchronization. **tpm** expands GiOps to include project management, offering a **single source of truth** for all software development lifecycle activities.
  * Keeping project status up-to-date can be challenging and often requires setting up and maintaining a BI subsystem within the project management system. **tpm** automatically generates all reports and statistics directly from the repository, up to the **latest commit**
  * Managing multiple software projects, especially when resources are shared, is inherently challenging and often causes numerous issues with timelines and estimates. **tpm** offers a comprehensive overview, or "eagle's view," of any number of projects.

## Quick start

* Install tpm
  ```
  npm i -g tln-pm@0.14.0
  ```
* Go to your project git repository root folder and create initial config
  ```
  tpm config --project --team --timeline --tasks
  ```
* Update **.tpm.yml** with project information, team structure, timeline and tasks. Use the same emails for tpm configuration which were used as part of git configuration.
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
    25.1.0:
      deadline: '2025-01-31T18:00:00.000Z'
  tasks: |
    [>:002:v25.1.0] Integrate auth library @alice.c
      [!] Add /iam/auth endpoint
      [>] Configure auth callbacks
    [-:001:v25.1.0] Create project structure @alice.c
  ```
* Now you can start managing your project using cli and git
  | Command | Description |
  | ------------- | -------------
  | tpm ls --backlog | Display tasks are in backlog for current git user (you) |
  | tpm ls -g alice.c | Display tasks in development were assigned to the Alice |
  | tpm ls -g alice.c --backlog | List of tasks are in Alice backlog |
* Next command will give you project "eagle view" inside browser **http://localhost:5445**
  ```
  tpm serve
  ```
  ![Dashboard](tpm-01.png)
  ![Team](tpm-02.png)

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
    | !      | blocked         |
    | +      | done            |
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
    [>] Configure auth callbacks
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

# tln-cicd-github
CI/CD skeleton

## Integration
* Add this repository using git subtree (execute from the root of the repository and add into main branch using merge commit)
  ```
  tln subtree-add -- --prefix .github/workflows --subtree https://github.com/project-talan/tln-cicd-github.git --ref v24.9.0 --squash
  ```
* Install Nodejs libraries (execute next command from the root of the repository)
  ```
  npm i js-yaml assign-deep fast-glob --save
  ```
* Copy .github/workflows/.tln.conf.template to the repository root and update it with actuail values: project name, terraform cloud parameters, AWS account etc.
  ```
  cp .github/workflows/.tln.conf.template .tln.conf
  ```
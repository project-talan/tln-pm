const NFRs = {
  correctness: {
    name: 'Correctness',
    desc: 'Correctness ensures that a software system accurately produces the expected results and adheres to its specified behavior and rules, meets its specifications and fulfills its intended purpose accurately',
    subs: {
      functionality: {
        name: 'Functionality',
        desc: 'Adherence to Specifications: Aligning system behavior with defined requirements.\nFunctionality Coverage: Implementing all required features comprehensively.',
        stages: {
          planning: {
            requireents: ['amber']
          },
          development: {
            requireents: ['amber']
          },
          integration: {
            requireents: ['amber']
          },
          testing: {
            requireents: ['red']
          },
          deployment: {
            requireents: ['green']
          },
          operation: {
            requireents: ['amber']
          },
        },
      },
      timeliness: {
        name: 'Timeliness',
        desc: 'The system produces results within the specified time frame',
        stages: {
          planning: {
            requireents: ['amber']
          },
          development: {
            requireents: ['']
          },
          integration: {
            requireents: []
          },
          testing: {
            requireents: []
          },
          deployment: {
            requireents: []
          },
          operation: {
            requireents: []
          },
        },
      }
    }
  },
  robustness: {
    name: 'Robustness',
    desc: 'Robustness ensures that a software system can handle unexpected inputs and conditions without crashing or producing incorrect results',
    subs: {
      faultTolerance: {
        name: 'Fault Tolerance',
        desc: 'The system can continue to operate in the event of a failure',
        stages: {
          planning: {
            requireents: ['red']
          },
          development: {
            requireents: ['green']
          },
          integration: {
            requireents: []
          },
          testing: {
            requireents: ['skip']
          },
          deployment: {
            requireents: ['green']
          },
          operation: {
            requireents: ['green']
          },
        },
      },
      errorHandling: {
        name: 'Error Handling',
        desc: 'Errors are handled gracefully and do not cause the system to crash',
        stages: {
          planning: {
            requireents: []
          },
          development: {
            requireents: ['amber']
          },
          integration: {
            requireents: ['green']
          },
          testing: {
            requireents: ['red']
          },
          deployment: {
            requireents: ['green']
          },
          operation: {
            requireents: ['amber']
          },
        },
      },
      recovery: {
        name: 'Recovery/Self-healing',
        desc: 'The system can recover from failures and resume normal operation',
        stages: {
          planning: {
            requireents: []
          },
          development: {
            requireents: []
          },
          integration: {
            requireents: []
          },
          testing: {
            requireents: []
          },
          deployment: {
            requireents: ['green']
          },
          operation: {
            requireents: ['amber']
          },
        },
      },
    }
  },
  extendibility: {
    name: 'Extendibility',
    desc: 'Extendibility ensures that a software system can be easily extended and modified to meet changing requirements',
    subs: {
      adaptability: {
        name: 'Adaptability',
        desc: 'The system can be easily adapted to new requirements and environments',
        stages: {
          planning: {
            requireents: ['amber']
          },
          development: {
            requireents: ['amber']
          },
          integration: {
            requireents: ['green']
          },
          testing: {
            requireents: ['red']
          },
          deployment: {
            requireents: ['green']
          },
          operation: {
            requireents: ['green']
          },
        },
      },
      abstractions: {
        name: 'Abstractions',
        desc: 'The system is built using abstractions that allow for easy extension and modification',
        stages: {
          planning: {
            requireents: ['green']
          },
          development: {
            requireents: ['amber', 'Domain Driven Development', 'Data Driven Development']
          },
          integration: {
            requireents: ['green']
          },
          testing: {
            requireents: ['red']
          },
          deployment: {
            requireents: ['green']
          },
          operation: {
            requireents: ['green']
          },
        },
      },
      modularity: {
        name: 'Modularity',
        desc: 'The system is built using modular components that can be easily replaced or modified',
        stages: {
          planning: {
            requireents: []
          },
          development: {
            requireents: ['green']
          },
          integration: {
            requireents: ['green']
          },
          testing: {
            requireents: ['red']
          },
          deployment: {
            requireents: ['amber']
          },
          operation: {
            requireents: ['amber']
          },
        },
      },
      elasticity: {
        name: 'Elasticity',
        desc: 'The system can easily scale to meet changing demands',
        stages: {
          planning: {
            requireents: []
          },
          development: {
            requireents: []
          },
          integration: {
            requireents: []
          },
          testing: {
            requireents: []
          },
          deployment: {
            requireents: []
          },
          operation: {
            requireents: []
          },
        },
      },
      modifiability: {
        name: 'Modifiability',
        desc: 'The system can be easily modified to meet new requirements',
        stages: {
          planning: {
            requireents: ['skip']
          },
          development: {
            requireents: ['amber']
          },
          integration: {
            requireents: ['green']
          },
          testing: {
            requireents: ['red']
          },
          deployment: {
            requireents: ['green']
          },
          operation: {
            requireents: ['amber']
          },
        },
      },
      flexibility: {
        name: 'Flexibility',
        desc: 'The system is flexible and can be easily adapted to new requirements',
        stages: {
          planning: {
            requireents: ['amber']
          },
          development: {
            requireents: ['amber']
          },
          integration: {
            requireents: ['green']
          },
          testing: {
            requireents: ['red']
          },
          deployment: {
            requireents: ['green']
          },
          operation: {
            requireents: ['green']
          },
        },
      },
      branding: {
        name: 'Branding',
        desc: 'The system can be easily branded and customized to meet specific needs',
        stages: {
          planning: {
            requireents: ['red']
          },
          development: {
            requireents: ['amber']
          },
          integration: {
            requireents: []
          },
          testing: {
            requireents: ['red']
          },
          deployment: {
            requireents: []
          },
          operation: {
            requireents: ['amber']
          },
        },
      },
    }
  },
  documentation: {
    name: 'Documentation',
    desc: 'Documentation ensures that a software system is well-documented and easy to understand',
    subs: {
      documentation: {
        name: 'Documentation',
        desc: 'Documentation ensures that a software system is well-documented and easy to understand',
        stages: {
          planning: {
            requireents: ['amber']
          },
          development: {
            requireents: ['amber']
          },
          integration: {
            requireents: ['green']
          },
          testing: {
            requireents: ['red']
          },
          deployment: {
            requireents: ['green']
          },
          operation: {
            requireents: ['amber']
          },
        },
      },
    }
  },
  interoperability: {
    name: 'Interoperability',
    desc: 'The capability of a system to work with or integrate other systems or products without special effort.',
    subs: {
      hardware: {
        name: 'Hardware',
        desc: 'The system can work with different hardware platforms and devices',
        stages: {
          planning: {
            requireents: []
          },
          development: {
            requireents: []
          },
          integration: {
            requireents: []
          },
          testing: {
            requireents: []
          },
          deployment: {
            requireents: []
          },
          operation: {
            requireents: []
          },
        },
      },
      software: {
        name: 'Software',
        desc: 'The system can work with different software platforms and applications',
        stages: {
          planning: {
            requireents: []
          },
          development: {
            requireents: []
          },
          integration: {
            requireents: []
          },
          testing: {
            requireents: []
          },
          deployment: {
            requireents: []
          },
          operation: {
            requireents: []
          },
        },
      },
      information: {
        name: 'Information',
        desc: 'The system can work with different information formats and standards',
        stages: {
          planning: {
            requireents: []
          },
          development: {
            requireents: []
          },
          integration: {
            requireents: []
          },
          testing: {
            requireents: []
          },
          deployment: {
            requireents: []
          },
          operation: {
            requireents: []
          },
        },
      },
      business: {
        name: 'Business processes',
        desc: 'The system can work with different business processes and workflows',
        stages: {
          planning: {
            requireents: []
          },
          development: {
            requireents: []
          },
          integration: {
            requireents: []
          },
          testing: {
            requireents: []
          },
          deployment: {
            requireents: []
          },
          operation: {
            requireents: []
          },
        },
      },
    }
  },
};

export default NFRs;

/*

      testability: {
        name: 'Testability',
        desc: 'The system is designed to be easily tested and verified',
        stages: {
          planning: {
            requireents: []
          },
          development: {
            requireents: []
          },
          integration: {
            requireents: []
          },
          testing: {
            requireents: []
          },
          deployment: {
            requireents: []
          },
          operation: {
            requireents: []
          },
        },
      },



Scalability: The ability of a system to handle increased loads by adding resources, such as data storage, memory, or processing power.
Scalability
  Traffic Pattern
  Elasticity
  Latency
Scalability
Traffic Pattern: Ability to handle varying levels of network traffic efficiently.
Elasticity: System's capability to adapt to workload changes by provisioning and de-provisioning resources automatically.
Latency: Time taken to process a request, impacting responsiveness.



Usability: How easy and user-friendly the system is, including ease of navigation, intuitive design, and accessibility for all users.
Usability
  API Contract
  Learnability
  Accessibility
Usability
API Contract: Consistent and reliable interface for using system services.
Learnability: Ease with which new users can learn to use the system.
Accessibility: Designing systems to be usable by people with various disabilities.
Usability
  Accessibility, WCAG,  Rehabilitation Act - Section 508
	User Standards (UI/UX)
	Internationalization / localization requirements



Reliability	???
	Data retention
	Stability
	Mean Time Between Failures
	Mean Time To Recovery/Repair
Reliability: The capability of a system to consistently perform its intended functions without failure over time.
Repairability	Backup & Restore procedures
  Disaster Recovery




Availability: The degree to which a system is operational and accessible when required for use, often measured in uptime percentages.
Availability
  Deployment Stamps
  Geodes
Availability
Deployment Stamps: Ensuring system components are distributed and highly available.
Geodes: Unique geographical deployment setups or configurations.
Availability	SLA
	Mintenance scenario(s)
Performance: The responsiveness, speed, and efficiency of a system under specific conditions. It includes response time, throughput, and resource availability.
  Response times
	Processing times
	Query and Reporting times



Security: Measures and protocols implemented to protect a system from unauthorized access, data breaches, and other threats.
Security
  Auditability
  Legality
    Compliance
    Privacy
    Certifications, 	Certification
  	Legal issue(s)
  	Licensing issue(s)
	  Patent-infringement-avoidability
	  Compliance (GDPR etc.)

  Authentication & Authorization
    MFA (Multi-Factor Authentication)
Security
Auditability: Tracking and logging user actions and system changes for later review.
Legality: Ensuring compliance with legal and regulatory requirements.
Authentication & Authorization: Verifying user identity and ensuring proper access control.
Compliance: Adherence to laws and regulations.
Privacy: Protecting sensitive user data.
Certifications: Obtaining industry-standard certifications.
MFA (Multi-Factor Authentication): Increasing security by requiring multiple forms of verification.
Compliance: Ensuring the system adheres to regulations, standards, or legal requirements relevant to its use or deployment.
Security
  Login/Logout/Restore access/2FA etc.
	SSO
	CRUD levels
	RBAC/ACL
	Password requirements
	Inactivity timeouts/Age tests
	Encryption
	Exploitability
	Privacy (GDPR etc.)
	Data Classification (marked and stored / protected)
Audit
  Full traceability (trace number/time stamps, etc.), PM artifacts
	Audited Objects
	Audited database fields
	Audited external storages
	Full history of changes
  Full history of access
  Full history of deletions
  Full history of creation
  Full history of modifications






Maintainability: The ease with which a system can be modified, including corrections, improvements, or adaptation to a changing environment.
Deployability
  Installability
  Upgradeability
  Portability
  Portability: The ability of a system to operate on various platforms or environments with minimal changes.
  Portability: Ease of moving software across environments.
Observability
  Alerts & Monitoring
  L1 / L2 / L3
  Logging
Observability
Alerts & Monitoring: Tracking system performance and triggering alerts for issues.
L1 / L2 / L3: Different levels of monitoring for varying issues.
Logging: Collecting and storing logs for auditing and troubleshooting.
Configurability
  Compatibility
  Ease of Development
Deployability
Installability: Ease of installation and setup.
Upgradeability: Ability to update with minimal disruption.
Configurability
Compatibility: System's ability to work with other products or systems.
Ease of Development: Simplifying development processes and reducing complexity.
Maintainability
  Enterprise Architecture standards
	Technical design standards
	Coding standards (SonarQube)
	Best practices (DRY, Single-Point-of-Truth, etc.)
	Prefer to use already existing libraries (NIH, etc.)
	Integrability
	Transparency
	Configuration management (DEVxx, QAxx, UATxx, PRODxx)
	Scalability (horizontal, vertical)
	Operability
	Readability
	Supportability
	Management
  API versioning
	Fresh/upgrade delivery procedure


Verifiability & Validatability
  Unit tests
	Seeds data
	Test cases
	Quality gates
	QCert process
	End-2-End tests (with & without mocks)
  Testability
  Testability: Ease of testing system components.
  Testability
  Penetrability
  Code coverage
  Regression







Efficiency: The system’s ability to manage resources optimally, ensuring minimal waste and maximum output.


Durability
  Replication
  Fault Tolerance
  Archivability
Durability
Replication: Duplicating data across systems to prevent loss.
Fault Tolerance: Continuation of operation even in the event of failures.
Archivability: Ensuring data can be stored and retrieved over long periods.
"Capacity Constraints"
  Throughput
	Storage – (memory/disk)
	Growth requirements



Resiliency
  Recoverability
  Design Patterns
    Disaster Recovery
    Bulkhead
    Circuit Breaker
    Leader Election
Resiliency
Recoverability: Ability to restore services quickly after a failure.
Design Patterns:
Disaster Recovery: Strategies to recover data and continue operations after catastrophic events.
Bulkhead: Isolation of system components to prevent a failure from spreading.
Circuit Breaker: Preventing repeated failures from overwhelming the system.
Leader Election: Ensuring a single active component to manage tasks.






Reusability	
Definition: The ability to use existing software components in different contexts or applications without modification.
Purpose: Enhances efficiency by reducing duplication of effort and leveraging existing solutions.
Focus: Creating components that can be used in multiple projects or areas.
Examples: Libraries, frameworks, or shared codebases that can be utilized across projects.

Consistency
  Data Freshness
Consistency
  Data Freshness: Ensuring data is up-to-date and accurate.
Integrity
  Solution
	Source code
	Data
	Information


Compatibility: refers to a system's ability to operate effectively in different environments and alongside other systems or components.
  Platform (Cloud agnostic, etc.)
	Software
	Tools
	Standards (API versioning, deprecation strategy etc.)

Efficiency
  PULL REQUEST bulds
	PUSH builds
	Mono-, Multi- repo
	Memory leaks free
  Economy


*/
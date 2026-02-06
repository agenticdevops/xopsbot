import type { ToolDefinition } from '../schema';

/**
 * aws tool definition with per-command risk classifications.
 * Source: risk-classifications.json -- 36 commands.
 */
export const awsTool = {
  name: 'aws',
  description: 'AWS Command Line Interface',
  defaultRisk: 'MEDIUM',
  binaryPatterns: ['*/aws'],
  commands: [
    // LOW -- read-only operations
    {
      command: 'describe',
      risk: 'LOW',
      description: 'Describe AWS resources (generic prefix)',
      readOnly: true,
    },
    {
      command: 'get',
      risk: 'LOW',
      description: 'Get AWS resource details (generic prefix)',
      readOnly: true,
    },
    {
      command: 'list',
      risk: 'LOW',
      description: 'List AWS resources (generic prefix)',
      readOnly: true,
    },
    {
      command: 'help',
      risk: 'LOW',
      description: 'Display help information for a service or command',
      readOnly: true,
    },
    {
      command: 'configure list',
      risk: 'LOW',
      description: 'List current AWS CLI configuration values',
      readOnly: true,
    },
    {
      command: 'sts get-caller-identity',
      risk: 'LOW',
      description: 'Return details about the IAM user or role making the call',
      readOnly: true,
    },
    {
      command: 's3 ls',
      risk: 'LOW',
      description: 'List S3 buckets or objects in a bucket',
      readOnly: true,
    },

    // HIGH -- S3 mutations
    {
      command: 's3 cp',
      risk: 'HIGH',
      description: 'Copy files to/from S3',
      readOnly: false,
    },
    {
      command: 's3 sync',
      risk: 'HIGH',
      description: 'Sync directories with S3',
      readOnly: false,
    },
    {
      command: 's3 mv',
      risk: 'HIGH',
      description: 'Move files to/from S3',
      readOnly: false,
    },

    // CRITICAL -- S3 destructive
    {
      command: 's3 rm',
      risk: 'CRITICAL',
      description: 'Delete S3 objects',
      readOnly: false,
    },
    {
      command: 's3 rb',
      risk: 'CRITICAL',
      description: 'Remove an S3 bucket',
      readOnly: false,
    },

    // HIGH -- EC2 mutations
    {
      command: 'ec2 run-instances',
      risk: 'HIGH',
      description: 'Launch new EC2 instances',
      readOnly: false,
    },
    {
      command: 'ec2 start-instances',
      risk: 'HIGH',
      description: 'Start stopped EC2 instances',
      readOnly: false,
    },
    {
      command: 'ec2 stop-instances',
      risk: 'HIGH',
      description: 'Stop running EC2 instances',
      readOnly: false,
    },
    {
      command: 'ec2 reboot-instances',
      risk: 'HIGH',
      description: 'Reboot EC2 instances',
      readOnly: false,
    },
    {
      command: 'ec2 modify',
      risk: 'HIGH',
      description: 'Modify EC2 resource attributes',
      readOnly: false,
    },
    {
      command: 'ec2 create',
      risk: 'HIGH',
      description: 'Create EC2 resources (security groups, key pairs, etc.)',
      readOnly: false,
    },

    // CRITICAL -- EC2 destructive
    {
      command: 'ec2 terminate-instances',
      risk: 'CRITICAL',
      description: 'Terminate EC2 instances (permanently destroys them)',
      readOnly: false,
    },
    {
      command: 'ec2 delete',
      risk: 'CRITICAL',
      description: 'Delete EC2 resources (security groups, snapshots, etc.)',
      readOnly: false,
    },

    // HIGH -- IAM mutations
    {
      command: 'iam create',
      risk: 'HIGH',
      description: 'Create IAM resources (users, roles, policies)',
      readOnly: false,
    },
    {
      command: 'iam attach',
      risk: 'HIGH',
      description: 'Attach IAM policies to users, groups, or roles',
      readOnly: false,
    },
    {
      command: 'iam detach',
      risk: 'HIGH',
      description: 'Detach IAM policies from users, groups, or roles',
      readOnly: false,
    },
    {
      command: 'iam put',
      risk: 'HIGH',
      description: 'Put inline IAM policies',
      readOnly: false,
    },

    // CRITICAL -- IAM destructive
    {
      command: 'iam delete',
      risk: 'CRITICAL',
      description: 'Delete IAM resources (users, roles, policies)',
      readOnly: false,
    },

    // HIGH -- RDS mutations
    {
      command: 'rds create',
      risk: 'HIGH',
      description: 'Create RDS database instances or clusters',
      readOnly: false,
    },
    {
      command: 'rds modify',
      risk: 'HIGH',
      description: 'Modify RDS database instances or clusters',
      readOnly: false,
    },
    {
      command: 'rds reboot',
      risk: 'HIGH',
      description: 'Reboot RDS database instances',
      readOnly: false,
    },

    // CRITICAL -- RDS destructive
    {
      command: 'rds delete',
      risk: 'CRITICAL',
      description: 'Delete RDS database instances or clusters',
      readOnly: false,
    },

    // HIGH -- Lambda mutations
    {
      command: 'lambda create',
      risk: 'HIGH',
      description: 'Create Lambda functions',
      readOnly: false,
    },
    {
      command: 'lambda update',
      risk: 'HIGH',
      description: 'Update Lambda function code or configuration',
      readOnly: false,
    },
    {
      command: 'lambda invoke',
      risk: 'HIGH',
      description: 'Invoke a Lambda function',
      readOnly: false,
    },

    // CRITICAL -- Lambda destructive
    {
      command: 'lambda delete',
      risk: 'CRITICAL',
      description: 'Delete Lambda functions',
      readOnly: false,
    },

    // HIGH -- CloudFormation mutations
    {
      command: 'cloudformation create-stack',
      risk: 'HIGH',
      description: 'Create a CloudFormation stack',
      readOnly: false,
    },
    {
      command: 'cloudformation update-stack',
      risk: 'HIGH',
      description: 'Update an existing CloudFormation stack',
      readOnly: false,
    },

    // CRITICAL -- CloudFormation destructive
    {
      command: 'cloudformation delete-stack',
      risk: 'CRITICAL',
      description: 'Delete a CloudFormation stack and its resources',
      readOnly: false,
    },
  ],
} satisfies ToolDefinition;

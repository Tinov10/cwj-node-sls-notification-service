import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ServiceStack } from './service-stack';

import { Topic, SubscriptionFilter } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

export class CwjNodeSlsNotificationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const topic = new Topic(this, 'notification_topic');

    const emailQueue = new Queue(this, 'email_queue', {
      visibilityTimeout: cdk.Duration.seconds(120),
    });

    const otpQueue = new Queue(this, 'otp_queue', {
      visibilityTimeout: cdk.Duration.seconds(120),
    });

    this.addSubscription(topic, emailQueue, ['customer_email']);
    this.addSubscription(topic, otpQueue, ['customer_otp']);

    const { emailHandler, otpHandler } = new ServiceStack(
      this,
      'notification_service',
      {}
    );

    emailHandler.addToRolePolicy(
      new PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
        effect: Effect.ALLOW,
      })
    );

    emailHandler.addEventSource(new SqsEventSource(emailQueue));

    otpHandler.addEventSource(new SqsEventSource(otpQueue));

    // export the arn
    new cdk.CfnOutput(this, 'NotificationTopic', {
      value: topic.topicArn,
      exportName: 'notifySvcArn',
    });
  }

  addSubscription(topic: Topic, queue: Queue, allowlist: string[]) {
    topic.addSubscription(
      new SqsSubscription(queue, {
        rawMessageDelivery: true,
        filterPolicy: {
          actionType: SubscriptionFilter.stringFilter({ allowlist }),
        },
      })
    );
  }
}

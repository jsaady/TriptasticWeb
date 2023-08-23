export class AddSubscriptionDTO {
  endpoint!: string;

  keys!: {
    p256dh: string;
    auth: string;
  };
}

export class SendNotificationDTO {
  userId!: number;
  title!: string;
  text!: string;
}

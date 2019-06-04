export const dependencies = ['@google-cloud/pubsub', '@sendgrid/mail']; 

export const main = (user: any, { pubsub, sendgrid }) => {
  console.log('User Created', user);
  console.log('Loaded dependencies', { pubsub, sendgrid });
}

import { query as q } from 'faunadb'
import { fauna } from '../../../services/fauna'
import { stripe } from '../../../services/stripe'

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  // 1. Fetch user in fauna with the customerId (stripe_customer_id)
  const userRef = await fauna.query(
    q.Select(
      'ref',
      q.Get(q.Match(q.Index('user_by_stripe_customer_id'), customerId))
    )
  )

  // 2. Save user subscription data on FaunaDB
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const subscriptionData = {
    id: subscription.id,
    user_id: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  }

  if (!createAction) {
    await fauna.query(
      // Replace is different from Update. While the last can update some fields,
      // the replace will replace all informations even the ref
      q.Replace(
        // SELECT you can select which "columns" you want
        q.Select(
          'ref',
          q.Get(q.Match(q.Index('subscription_by_id'), subscriptionId))
        ),
        {
          data: subscriptionData,
        }
      )
    )

    return
  }

  await fauna.query(
    q.If(
      q.Not(q.Exists(q.Match(q.Index('subscription_by_id'), subscriptionId))),
      q.Create(q.Collection('subscriptions'), { data: subscriptionData }),
      q.Get(q.Match(q.Index('subscription_by_id'), subscriptionId))
    )
  )
}

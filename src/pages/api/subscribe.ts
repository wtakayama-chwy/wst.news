import { query as q } from 'faunadb'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { fauna } from '../../services/fauna'
import { stripe } from '../../services/stripe'

export type SubscriptionResponseData = {
  sessionId: string
}

type User = {
  ref: {
    id: string
  }
  data: {
    stripe_customer_id: string
  }
}

export default async function subscribe(
  req: NextApiRequest,
  res: NextApiResponse<SubscriptionResponseData>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end(`Method ${req.method} not allowed`)
  }

  try {
    const { priceId } = req.body

    const session = await getSession({ req })

    if (session == null) {
      throw new Error('Session is mandatory')
    }

    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index('user_by_email'), q.Casefold(session.user!.email!)))
    )

    let customerId = user.data.stripe_customer_id

    if (customerId == null) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user!.email!,
      })

      if (stripeCustomer == null) {
        throw new Error('Stripe customer is mandatory')
      }

      await fauna.query(
        q.Update(q.Ref(q.Collection('users'), user.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id,
          },
        })
      )
      customerId = stripeCustomer.id
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${process.env.APP_URL}/posts`,
      cancel_url: `${process.env.APP_URL}/`,
    })

    return res.status(200).json({ sessionId: stripeCheckoutSession.id })
  } catch (error: any) {
    res
      .status(500)
      .end(`[SUBSCRIBE-ERROR] - Something went wrong ${error.message}`)
  }
}

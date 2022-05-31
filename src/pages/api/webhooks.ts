import type { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'stream'
import Stripe from 'stripe'
import { stripe } from '../../services/stripe'
import { saveSubscription } from './_lib/manageSubscription'

async function buffer(readable: Readable) {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  return Buffer.concat(chunks)
}

// We need to tell NextJS to disable the bodyParser. This is
// because the request will arrive as a stream and not as a JSON
export const config = {
  api: {
    bodyParser: false,
  },
}

type WebhooksResponseData =
  | {
      received: boolean
    }
  | {
      error: string
    }

const relevantsEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export default async function webhooks(
  req: NextApiRequest,
  res: NextApiResponse<WebhooksResponseData>
) {
  const buff = await buffer(req)
  const secret = req.headers['stripe-signature']

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end(`Method ${req.method} not allowed`)
  }

  let event: Stripe.Event

  try {
    if (process.env.STRIPE_WEBHOOKS_SECRET_KEY == null) {
      throw new Error('STRIPE_WEBHOOKS_SECRET_KEY is missing')
    }

    if (secret == null) {
      throw new Error('Secret is mandatory')
    }

    event = stripe.webhooks.constructEvent(
      buff,
      secret,
      process.env.STRIPE_WEBHOOKS_SECRET_KEY as string
    )

    const { type } = event

    if (relevantsEvents.has(type)) {
      try {
        await stripeEventsHandlers({ e: event, type })
      } catch (e) {
        // we must not send a error status because stripe will retry it
        return res.json({ error: 'Webhook handler failed.' })
      }
    }

    res.status(200).json({ received: true })
  } catch (err: any) {
    res.status(400).end(`[WEBHOOK-ERROR] - Something went wrong ${err.message}`)
  }
}

const stripeEventsHandlers = ({
  e,
  type = 'default',
}: {
  e: Stripe.Event
  type: string
}) => {
  const EVENT_ACTIONS: Record<string, any> = {
    'checkout.session.completed': {
      action: async () => {
        const checkoutSession = e.data.object as Stripe.Checkout.Session

        await saveSubscription(
          String(checkoutSession.subscription),
          String(checkoutSession.customer),
          true
        )
      },
    },
    'customer.subscription.created': {
      action: async () => {
        const subscription = e.data.object as Stripe.Subscription

        await saveSubscription(
          String(subscription.id),
          String(subscription.customer),
          true
        )
      },
    },
    'customer.subscription.updated': {
      action: async () => {
        const subscription = e.data.object as Stripe.Subscription

        await saveSubscription(
          String(subscription.id),
          String(subscription.customer)
        )
      },
    },
    'customer.subscription.deleted': {
      action: async () => {
        const subscription = e.data.object as Stripe.Subscription

        await saveSubscription(
          String(subscription.id),
          String(subscription.customer)
        )
      },
    },
    default: {
      action: () => {
        throw new Error(`Unhandled event.`)
      },
    },
  }

  return EVENT_ACTIONS[type].action()
}

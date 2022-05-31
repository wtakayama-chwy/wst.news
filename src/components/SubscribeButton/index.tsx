import { signIn, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { toast } from 'react-toast'
import { SubscriptionResponseData } from '../../pages/api/subscribe'
import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js'
import { getErrorMessage, someReportError } from '../../utils/error'
import styles from './styles.module.scss'

export function SubscribeButton() {
  const [session] = useSession()
  const router = useRouter()

  async function handleSubscribe() {
    if (session == null) {
      signIn('github')
      return
    }

    if (session.activeSubscription) {
      router.push('/posts')
      return
    }

    // Create checkout session - we must not use stripe instance directly on front-end.
    // Then we will use it on the API Routes from NEXTJS
    try {
      const response = await api.post<SubscriptionResponseData>('/subscribe', {
        priceId: 'price_1JGnB2DTe91J19Ucatta5YkA',
      })

      const { sessionId } = response.data

      const stripe = await getStripeJs()

      await stripe?.redirectToCheckout({
        sessionId,
      })
    } catch (err) {
      toast.error('Sorry... something went wrong')
      someReportError({ message: getErrorMessage(err) })
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}

import { useNoCodeFacade } from './hooks'
import { NoCodeChat } from './components'

/**
 * No-Code view — guided natural-language chat. Claude investigates the database
 * and answers directly; SQL and warning blocks are hidden from the user.
 */
const NoCode = () => {
  const { data, action } = useNoCodeFacade()

  return (
    <NoCodeChat
      messages={data.messages}
      streaming={data.streaming}
      error={data.error}
      isConnected={data.isConnected}
      apiKey={data.apiKey}
      authStatus={data.authStatus}
      onSend={action.send}
      onStop={action.stop}
      onClearError={action.clearError}
      onReset={action.reset}
      onConfigureAccess={action.openConnection}
    />
  )
}

export default NoCode

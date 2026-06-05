import { useWorkspaceFacade } from './hooks'
import { ChatPanel, HistoryPanel, ResultsPanel, SchemaPanel } from './components'

/**
 * Workspace — the SQL chat workspace. Three panels: schema browser (left),
 * results table/chart/SQL (center) with query history below, and the Claude
 * chat (right). Orchestrates the facade; holds no business logic itself.
 */
const Workspace = () => {
  const { data, action } = useWorkspaceFacade()

  return (
    <div
      className='grid h-full min-h-0 grid-cols-1 gap-3 p-3 lg:[grid-template-columns:260px_minmax(0,1fr)_380px] lg:[grid-template-rows:minmax(0,1fr)_auto]'
    >
      <div className='min-h-0 lg:row-span-2'>
        <SchemaPanel
          schema={data.schema}
          onRefresh={action.refetchSchema}
          onTableClick={action.onTableClick}
        />
      </div>

      <div className='min-h-0 lg:col-start-2 lg:row-start-1'>
        <ResultsPanel
          result={data.result}
          onRun={action.runAndShow}
          exportSql={action.exportSql}
          downloadExport={action.downloadExport}
        />
      </div>

      <div className='min-h-0 lg:col-start-3 lg:row-start-1 lg:row-span-2'>
        <ChatPanel
          messages={data.chat.messages}
          streaming={data.chat.streaming}
          error={data.chat.error}
          isConnected={data.isConnected}
          apiKey={data.apiKey}
          authStatus={data.authStatus}
          onSend={action.sendChat}
          onStop={action.stopChat}
          onClearError={action.clearChatError}
          onConfigureAccess={action.openConnection}
          onRun={action.runAndShow}
          downloadExport={action.downloadExport}
        />
      </div>

      <div className='max-h-[30vh] min-h-0 lg:col-start-2 lg:row-start-2'>
        <HistoryPanel history={data.queryHistory} onSelect={action.reloadFromHistory} />
      </div>
    </div>
  )
}

export default Workspace

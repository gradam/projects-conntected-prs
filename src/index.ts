import { Application } from 'probot' // eslint-disable-line no-unused-vars
import { getIssueIds } from './utils'
import { STATE_TO_COLUMN } from './constants'
import { getIssuesWithCards } from './graphql'

export = (app: Application) => {
  app.on(['pull_request', 'pull_request_review.submitted'], async context => {
    const body = context.payload.pull_request.body
    const connectedIssuesIds = getIssueIds(body)
    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name

    for (const issueId of connectedIssuesIds) {
      // @ts-ignore
      const { repository } = await context.github.graphql(getIssuesWithCards(issueId, repo, owner))

      // Get new column name
      let newColumn: string
      if (context.payload.action === 'review_requested') {
        newColumn = STATE_TO_COLUMN.reviewInProgress
      } else if (context.payload.action === 'submitted') {
        // It's review!
        if (context.payload.review.state === 'changes_requested') {
          newColumn = STATE_TO_COLUMN.inProgress
        } else if (context.payload.review.state === 'approved') {
          newColumn = STATE_TO_COLUMN.pullRequestApproved
        }
      } else if (['edited', 'opened', 'reopened'].includes(context.payload.action)) {
        newColumn = STATE_TO_COLUMN.inProgress
      } else {
        return
      }

      // Move each realted card to new column
      const cards = repository.issue.projectCards.nodes
      for (const card of cards) {
        const newColumnId = card.project.columns.nodes.find((column: any) => column.name === newColumn).databaseId
        context.github.projects.moveCard({
          card_id: card.databaseId,
          position: 'top',
          column_id: newColumnId,
        })
      }
    }
  })
}

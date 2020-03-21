export const getIssuesWithCards = (issueId: number, repoName: string, owner: string) => `
query {
  repository(name:"${repoName}", owner:"${owner}") {
    issue(number: ${issueId}) {
      projectCards(archivedStates: NOT_ARCHIVED) {
        nodes{
          databaseId
          column {
            name
            id
          }
          project {
            columns(first: 10) {
              nodes {
                name
                databaseId
              }
            }
          }
        }
      }
    }
  }
}
`

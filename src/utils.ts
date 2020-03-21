import { LINKING_KEYWORDS } from './constants'

export const issueNumberRegex = new RegExp(`(${LINKING_KEYWORDS.join('|')})\\s*\\#(?<issueNumber>\\d+)`, 'gmi')

export function getIssueIds(body: string): Array<number> {
  let match
  const numbers: Array<number> = []
  while ((match = issueNumberRegex.exec(body))) {
    if (match.groups && match.groups.issueNumber) {
      numbers.push(parseInt(match.groups.issueNumber, 10))
    }
  }
  return numbers
}

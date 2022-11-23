import React from 'react'
import { CSVLink } from 'react-csv'
import { FormattedMessage } from 'react-intl'
import { connect, ConnectedProps } from 'react-redux'
import { Button, IconDownload, SemanticColors } from '@blockchain-com/constellation'
import { flatten, map } from 'ramda'
import { bindActionCreators, Dispatch } from 'redux'
import styled, { css } from 'styled-components'

import { HeartbeatLoader, IconButton } from 'blockchain-info-components'
import { actions, selectors } from 'data'
import { EarnHistoryCoinFormType } from 'data/components/interest/types'
import { RootState } from 'data/rootReducer'
import { Analytics } from 'data/types'

const IconButtonCss = css`
  border: 1px solid ${(props) => props.theme.grey100};
  border-radius: 8px;
  margin-right: 12px;
`
const DownloadButton = styled(CSVLink)`
  text-decoration: none;
`
const StyledIconButton = styled(IconButton)`
  ${IconButtonCss};
  color: ${(props) => props.theme.blue600};
`
const SuccessIconButton = styled(IconButton)`
  ${IconButtonCss};
  color: ${(props) => props.theme.white};
  background-color: ${(props) => props.theme.green600};
  opacity: 1;
`
const FailedIconButton = styled(IconButton)`
  ${IconButtonCss};
  color: ${(props) => props.theme.white};
  background-color: ${(props) => props.theme.red600};
  opacity: 1;
`
const LoadingButton = styled(Button)`
  margin-right: 12px;
  opacity: 1;

  & > :first-child {
    margin-right: 8px;
  }
`
class DownloadTransactions extends React.PureComponent<Props> {
  state: StateProps = { hasSavedReport: false }

  componentDidUpdate(prevProps) {
    const { earnActions, formValues } = this.props

    if (prevProps.formValues?.coin !== formValues?.coin) {
      earnActions.clearInterestTransactionsReport()
      this.setState({ hasSavedReport: false }) // eslint-disable-line
    }
  }

  componentWillUnmount() {
    this.props.earnActions.clearInterestTransactionsReport()
  }

  handleDownload = () => {
    const {
      analyticsActions,
      earnActions,
      formValues: { coin }
    } = this.props
    analyticsActions.trackEvent({
      key: Analytics.WALLET_REWARDS_TRANSACTION_HISTORY_DOWNLOAD_CLICKED,
      properties: {
        currency: coin
      }
    })
    earnActions.fetchEarnTransactionsReport()
  }

  handleSaveReport = () => {
    this.setState({ hasSavedReport: true })
  }

  render() {
    const { transactionsReportR, txPages } = this.props
    const txList = flatten(
      txPages &&
        // @ts-ignore
        txPages.map((pages) => map((page) => page, (pages && pages.data) || []))
    )

    return (
      txList?.length > 0 &&
      transactionsReportR.cata({
        Failure: () => (
          <FailedIconButton
            data-e2e='interestTxReportFailed'
            height='45px'
            name='alert-filled'
            nature='primary'
            width='140px'
          >
            <FormattedMessage id='copy.failed' defaultMessage='Failed' />
          </FailedIconButton>
        ),
        Loading: () => (
          <LoadingButton
            data-e2e='loadingTransactionsReportButton'
            disabled
            height='45px'
            nature='empty-blue'
          >
            <HeartbeatLoader height='16px' width='16px' />
          </LoadingButton>
        ),
        NotAsked: () => (
          <Button
            as='button'
            onClick={this.handleDownload}
            size='default'
            state='initial'
            text={<IconDownload size='medium' color={SemanticColors.primary} />}
            variant='minimal'
          />
        ),
        Success: (val) => {
          // potential race condition in render - ensure data is always valid for csv
          const valResults = Array.isArray(val) ? val : [[], []]
          return this.state.hasSavedReport ? (
            <SuccessIconButton
              data-e2e='interestTxReportSaved'
              disabled
              height='45px'
              name='checkmark-in-circle-filled'
              nature='primary'
              width='140px'
            >
              <FormattedMessage id='copy.saved' defaultMessage='Saved' />
            </SuccessIconButton>
          ) : (
            <DownloadButton
              data={valResults}
              filename='Interest_Transactions.csv'
              onClick={this.handleSaveReport}
              target='_blank'
              width='100%'
            >
              <StyledIconButton
                data-e2e='saveInterestTxReport'
                height='45px'
                name='download'
                nature='light'
                width='140px'
              >
                <FormattedMessage
                  id='scenes.interest.transactions.savefile'
                  defaultMessage='Save file'
                />
              </StyledIconButton>
            </DownloadButton>
          )
        }
      })
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  formValues: selectors.form.getFormValues('earnHistoryCoin')(state) as EarnHistoryCoinFormType,
  transactionsReportR: selectors.components.interest.getInterestTransactionsReport(state),
  txPages: selectors.components.interest.getEarnTransactions(state)
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  analyticsActions: bindActionCreators(actions.analytics, dispatch),
  earnActions: bindActionCreators(actions.components.interest, dispatch)
})

const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector>
type StateProps = {
  hasSavedReport: boolean
}

export default connector(DownloadTransactions)

import React from 'react';
import { useLocation, useParams } from 'react-router';
import BigNumber from 'bignumber.js';
import queryString from 'query-string';

import { useLiquidationCallMutation } from '../../apollo/generated';
import { useWeb3Context } from '../../web3-data-provider';
import TxConfirmationView from 'components/TxConfirmationView';

export default function LiquidationConfirmation() {
  const [LiquidationCallMutation] = useLiquidationCallMutation();
  const location = useLocation();
  const { collateralReserve, reserveId } = useParams();
  const { wallet } = useWeb3Context();

  let amount: any = '';
  const query = queryString.parse(location.search);
  if (typeof query.amount === 'string') {
    amount = new BigNumber(query.amount);
  }

  const liquidationCall = async () => {
    const result = await LiquidationCallMutation({
      variables: {
        data: {
          userAddress: wallet || '',
          collateralReserve: collateralReserve || '',
          purchaseAmount: amount.toString(),
          reserve: reserveId || '',
        },
      },
    });
    return (result && result.data && result.data.liquidationCall) || [];
  };

  return (
    <TxConfirmationView
      caption="Liquidation"
      boxTitle="Liquidation"
      getTransactionsData={liquidationCall}
    >
      <p>
        <span>Amount: </span>
        {amount.toString()}
      </p>
    </TxConfirmationView>
  );
}

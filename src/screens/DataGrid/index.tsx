import React, { ChangeEvent, useState, memo } from 'react';
import { useHistory } from 'react-router';
import classNames from 'classnames';
import queryString from 'query-string';

import { useThemeContext, rgba } from 'libs/theme-provider';
import LiquidationForm from 'components/LiquidationForm';
import SearchField from 'components/fields/SearchField';
import Link from 'components/Link';

import staticStyles from './style';

interface DataGridProps {
  searchValue: string;
  setSearchValue: any;
  userReserves: any;
}

function DataGrid({ searchValue, setSearchValue, userReserves }: DataGridProps) {
  const { currentTheme } = useThemeContext();
  const history = useHistory();

  const [activeItem, setActiveItem] = useState('');
  const [activeFormData, setActiveFormData] = useState(undefined);
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const lastPage =
    Math.round(userReserves.length / pageSize) !== 0
      ? Math.round(userReserves.length / pageSize)
      : 1;
  const userReservesPagination = userReserves.slice((page - 1) * pageSize, page * pageSize);

  const setEmptyItem = () => {
    setActiveItem('');
    setActiveFormData(undefined);
  };

  const handlePageButtonClick = (type: 'prev' | 'next') => {
    if (type === 'next') {
      setPage(page + 1);
    } else {
      setPage(page - 1);
    }
    setEmptyItem();
  };
  const pageGoTo = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setPage(
      Number(event.target.value) === 0
        ? 1
        : Number(event.target.value) > lastPage
        ? lastPage
        : Number(event.target.value)
    );
    setEmptyItem();
  };

  const onToggle = (userId: string, reserveId: string) => {
    setActiveItem(`${userId}${reserveId}`);
    const formData = userReserves.find(
      (userReserve: any) =>
        `${userId}${reserveId}` === `${userReserve.user.id}${userReserve.reserve.id}`
    );
    // @ts-ignore
    setActiveFormData(formData);
  };
  const hoverColor = rgba(`${currentTheme.secondary.rgb}, 0.4`);

  const handleSubmit = async (
    amount: string,
    collateralReserve: string,
    reserveId: string,
    symbol: string
  ) => {
    const query = queryString.stringify({ symbol, amount });
    history.push(`/liquidation/${collateralReserve}/${reserveId}/confirmation?${query}`);
  };

  return (
    <div className="DataGrid">
      <div className="DataGrid__navigation-inner">
        <div className="DataGrid__search-inner">
          <SearchField
            placeholder="Search by address"
            value={searchValue}
            onChange={setSearchValue}
            additionalFunctionOnChange={() => setEmptyItem()}
          />
        </div>
        {lastPage > 1 && (
          <div className="DataGrid__pagination-inner">
            <button
              onClick={() => handlePageButtonClick('prev')}
              disabled={page === 1}
              className="DataGrid__pagination-button DataGrid__pagination-buttonPrev"
              type="button"
            />
            <button
              onClick={() => handlePageButtonClick('next')}
              disabled={page === lastPage}
              className="DataGrid__pagination-button DataGrid__pagination-buttonNext"
              type="button"
            />

            <div className="DataGrid__pageGoTo">
              <span>Go to</span>
              <input type="number" max={lastPage} min={1} onChange={pageGoTo} />
            </div>

            <p className="DataGrid__page-counter">
              Page {page} / {lastPage}
            </p>
          </div>
        )}
      </div>

      <div className="DataGrid__content">
        <div className="DataGrid__table-inner">
          {userReservesPagination.map((userReserve: any, i: number) => (
            <div
              className={classNames('DataGrid__item', {
                DataGrid__itemActive:
                  activeItem === `${userReserve.user.id}${userReserve.reserve.id}`,
              })}
              key={i}
            >
              <button
                className="DataGrid__item-button"
                type="button"
                onClick={() => onToggle(userReserve.user.id, userReserve.reserve.id)}
              >
                <p>
                  <span>Address</span>
                  <Link
                    to={`https://etherscan.io/address/${userReserve.user.id}`}
                    title={userReserve.user.id}
                    absolute={true}
                    inNewWindow={true}
                    className="DataGrid__link"
                  />
                </p>
                <p>
                  <span>Health factor</span>
                  {userReserve.user.healthFactor}
                </p>
                <p>
                  <span>Total Borrows (ETH)</span>
                  {userReserve.user.totalBorrowsWithFeesETH}
                </p>
                <p>
                  <span>Total Collateral (ETH)</span>
                  {userReserve.user.totalCollateralETH}
                </p>
              </button>
            </div>
          ))}
        </div>

        <div className="DataGrid__form-inner">
          {activeFormData && (
            <LiquidationForm onSubmit={handleSubmit} userReserve={activeFormData} />
          )}
        </div>
      </div>

      <style jsx={true} global={true}>
        {staticStyles}
      </style>
      <style jsx={true} global={true}>{`
        @import 'src/_mixins/vars';
        @import 'src/_mixins/screen-size';

        .DataGrid {
          &__item {
            background: ${currentTheme.whiteElement.hex};
            &:hover {
              box-shadow: 0 1px 12px 0 ${hoverColor} !important;
              border-color: ${hoverColor} !important;
            }
          }

          &__item-button {
            color: ${currentTheme.gray.hex};
          }

          &__pagination-button {
            border-color: ${currentTheme.secondary.hex};
            &:disabled {
              border-color: ${currentTheme.disabledElement.hex};
              &:after {
                border-color: ${currentTheme.disabledElement.hex};
              }
            }
            &:after {
              border-color: ${currentTheme.secondary.hex};
            }
          }

          &__page-counter {
            color: ${currentTheme.gray.hex};
          }

          &__pageGoTo {
            color: ${currentTheme.gray.hex};
            input {
              color: ${currentTheme.gray.hex};
              border: 1px solid ${currentTheme.lightGray.hex};
            }
          }

          &__itemActive {
            box-shadow: 0 1px 12px 0 ${hoverColor} !important;
            border-color: ${hoverColor} !important;
          }

          &__link {
            color: ${currentTheme.gray.hex} !important;
          }
        }
      `}</style>
    </div>
  );
}

export default memo(DataGrid);

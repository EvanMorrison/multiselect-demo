import styled from "@emotion/styled";

export default styled.div`
  &.multi-select {
    height: auto;
    position: relative;

    div.disabled {
      cursor: not-allowed;
      background: ${props => props.theme.colors.inputDisabled};
      opacity: 0.6;

      input {
        cursor: not-allowed;
        background: ${props => props.theme.colors.inputDisabled};
      }
    }

    div.focus {
      border-color: ${props => props.theme.colors.info};
      box-shadow: 0 0 8px -1px ${props => props.theme.colors.info};
    }

    &.error {
      border-color: ${props => props.theme.colors.danger};
      background: ${props => props.theme.colors.pageBackground};
    }

    .select-box {
      width: 100%;
      height: auto;
      min-height: 32px;
      max-height: ${props => props.boxHeight}px;
      overflow-y: auto;
      border-radius: 5px;
      border-width: 1px;
      border-style: solid;
      transition: border 200ms ease;
      color: ${props => props.theme.colors.textOnPageBackground};
      border-color: ${props => props.theme.colors.inputBorder};
      background: ${props => props.theme.colors.pageBackground};
      font-size: 14px;
      padding: 3px 15px 3px 6px;

      .pills-wrapper {
        width: auto;
        padding-right: 6px;

        .pill {
          display: inline-block;
          max-width: 95%;
          overflow-wrap: break-word;
          font-size: 14px;
          line-height: 26px;
          margin: 3px 6px 3px 0;
          border: 1px solid ${props => props.theme.colors.border};
          border-radius: 5px;
          padding: 0 3px;
          cursor: pointer;

          .remove {
            margin: 0 3px 0 0;
          }

          &:hover {
            background-color: ${props => props.theme.colors.primary};
            color: ${props => props.theme.colors.textOnPrimary};

            svg {
              fill: ${props => props.theme.colors.textOnPrimary};
            }
          }
        }

        input.multi-select-input {
          border: none;
          display: inline-block;
          font-size: 14px;
          height: 18px;
          min-width: 12px;
          width: 12px;
          margin: 0 4px;
        }
      }

      .remove-all {
        position: absolute;
        display: inline-block;
        right: 5px;
        top: 4px;
        padding: 5px;
        cursor: pointer;
      }

      &.size-lg {
        min-height: 40px;

        .pills-wrapper {
          .pill {
            font-size: 18px;
            line-height: 21px;
            margin: 3px 3px 3px 0;
            padding: 0 3px;
          }

          input.multi-select-input {
            font-size: 18px;
            height: 24px;
          }
        }
      }

      &.size-sm {
        padding: 0 15px 0 6px;
        min-height: 24px;

        .pills-wrapper {
          .pill {
            font-size: 12px;
            line-height: 14px;
            margin: 3px 3px 3px 0;
            padding: 0 3px;
          }

          input.multi-select-input {
            font-size: 12px;
            height: 16px;
          }
        }

        .remove-all {
          padding: 0;
        }
      }
    }

    .select-options-preview {
      position: absolute;
      top: calc(100% - 4px);
      font-size: 14px;
      width: 100%;
      max-height: ${props => props.boxHeight}px;
      overflow-y: auto;
      padding: 3px 6px;
      z-index: ${props => props.theme.zIndexes["dropDown"]};
      background-color: ${props => props.theme.colors.border};
      border: 1px solid ${props => props.theme.colors.inputBorder};
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;

      .select-option-pill, .select-all, .remove-all-selected {
        width: 100%;
        max-width: 100%;
        display: inline-block;
        overflow-wrap: break-word;
        border-radius: 5px;
        background-color: ${props => props.theme.colors.pageBackground};
        color: ${props => props.theme.colors.textOnPageBackground};
        font-size: 14px;
        line-height: 21px;
        margin: 3px;
        padding: 0 6px;
        cursor: pointer;

        .checkbox {
          margin-right: 3px;
        }

        &:hover, &.active {
          background-color: ${props => props.theme.colors.primary};
          color: ${props => props.theme.colors.textOnPrimary};
        }

        &.selected {
          opacity: 0.8;
        }
      }

      &.size-lg {
        .select-option-pill, .select-all, .remove-all-selected {
          font-size: 18px;
          line-height: 21px;
        }
      }

      &.size-sm {
        .select-option-pill, .select-all, .remove-all-selected {
          font-size: 12px;
          line-height: 14px;
        }
      }
    }
  }
`;

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'mini-store';
import TableCell from './TableCell';

class TableRow extends React.Component {
  static propTypes = {
    onRowClick: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    onRowContextMenu: PropTypes.func,
    onRowMouseEnter: PropTypes.func,
    onRowMouseLeave: PropTypes.func,
    record: PropTypes.object,
    prefixCls: PropTypes.string,
    onHover: PropTypes.func,
    columns: PropTypes.array,
    height: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    index: PropTypes.number,
    rowKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
    className: PropTypes.string,
    indent: PropTypes.number,
    indentSize: PropTypes.number,
    hasExpandIcon: PropTypes.func.isRequired,
    hovered: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
    store: PropTypes.object.isRequired,
    fixed: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),
    renderExpandIcon: PropTypes.func,
    renderExpandIconCell: PropTypes.func,
  }

  static defaultProps = {
    onRowClick() {},
    onRowDoubleClick() {},
    onRowContextMenu() {},
    onRowMouseEnter() {},
    onRowMouseLeave() {},
    expandIconColumnIndex: 0,
    expandRowByClick: false,
    onHover() {},
    hasExpandIcon() {},
    renderExpandIcon() {},
    renderExpandIconCell() {},
  }

  constructor(props) {
    super(props);

    this.shouldRender = props.visible;

    // avoid creating new object which may fail the sCU.
    this.style = {};
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.visible || (!this.props.visible && nextProps.visible)) {
      this.shouldRender = true;
    }
  }

  onRowClick = (event) => {
    const { record, index, onRowClick } = this.props;
    onRowClick(record, index, event);
  }

  onRowDoubleClick = (event) => {
    const { record, index, onRowDoubleClick } = this.props;
    onRowDoubleClick(record, index, event);
  }

  onContextMenu = (event) => {
    const { record, index, onRowContextMenu } = this.props;
    onRowContextMenu(record, index, event);
  }

  onMouseEnter = (event) => {
    const { record, index, onRowMouseEnter, onHover, rowKey } = this.props;
    onHover(true, rowKey);
    onRowMouseEnter(record, index, event);
  }

  onMouseLeave = (event) => {
    const { record, index, onRowMouseLeave, onHover, rowKey } = this.props;
    onHover(false, rowKey);
    onRowMouseLeave(record, index, event);
  }

  setHeight() {
    const { store, rowKey } = this.props;
    const { expandedRowsHeight } = store.getState();
    const height = this.rowRef.getBoundingClientRect().height;
    expandedRowsHeight[rowKey] = height;
    store.setState({ expandedRowsHeight });
  }

  getStyle() {
    const { height, visible } = this.props;

    if (height && height !== this.style.height) {
      this.style = { ...this.style, height };
    }

    if (!visible && !this.style.display) {
      this.style = { ...this.style, display: 'none' };
    }

    return this.style;
  }

  saveRowRef = (node) => {
    this.rowRef = node;
    if (node) {
      if (!this.props.fixed) {
        this.setHeight();
      }
    }
  }

  render() {
    if (!this.shouldRender) {
      return null;
    }

    const {
      prefixCls,
      columns,
      record,
      index,
      indent,
      indentSize,
      hovered,
      hasExpandIcon,
      renderExpandIcon,
      renderExpandIconCell,
    } = this.props;

    let { className } = this.props;

    if (hovered) {
      className += ` ${prefixCls}-hover`;
    }

    const cells = [];

    renderExpandIconCell(cells);

    for (let i = 0; i < columns.length; i++) {
      cells.push(
        <TableCell
          prefixCls={prefixCls}
          record={record}
          indentSize={indentSize}
          indent={indent}
          index={index}
          column={columns[i]}
          key={columns[i].key || columns[i].dataIndex}
          expandIcon={hasExpandIcon(i) && renderExpandIcon()}
        />
      );
    }

    const rowClassName =
      `${prefixCls} ${className} ${prefixCls}-level-${indent}`.trim();

    return (
      <tr
        ref={this.saveRowRef}
        onClick={this.onRowClick}
        onDoubleClick={this.onRowDoubleClick}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onContextMenu={this.onContextMenu}
        className={rowClassName}
        style={this.getStyle()}
      >
        {cells}
      </tr>
    );
  }
}

function getRowHeight(state, props) {
  const { expandedRowsHeight, fixedColumnsBodyRowsHeight } = state;
  const { fixed, index, rowKey } = props;

  if (!fixed) {
    return null;
  }

  if (expandedRowsHeight[rowKey]) {
    return expandedRowsHeight[rowKey];
  }

  if (fixedColumnsBodyRowsHeight[index]) {
    return fixedColumnsBodyRowsHeight[index];
  }

  return null;
}

export default connect((state, props) => {
  const { currentHoverKey, expandedRowKeys } = state;
  const { rowKey, ancestorKeys } = props;
  const visible = ancestorKeys.length === 0 || ancestorKeys.every(k => ~expandedRowKeys.indexOf(k));

  return ({
    visible,
    hovered: currentHoverKey === rowKey,
    height: getRowHeight(state, props),
  });
})(TableRow);

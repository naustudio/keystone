import React, { PropTypes } from 'react';
import classnames from 'classnames';

import TableRow from './ItemsTableRow';
import DragDrop from './ItemsTableDragDrop';

import { TABLE_CONTROL_COLUMN_WIDTH } from '../../../../../constants';

const ItemsTable = React.createClass({
	propTypes: {
		checkedItems: PropTypes.object.isRequired,
		columns: PropTypes.array.isRequired,
		deleteTableItem: PropTypes.func.isRequired,
		handleSortSelect: PropTypes.func.isRequired,
		items: PropTypes.object.isRequired,
		list: PropTypes.object.isRequired,
		manageMode: PropTypes.bool.isRequired,
		rowAlert: PropTypes.object.isRequired,
	},
	renderCols () {
		let cols = this.props.columns.map(col => (
			<col key={col.path} width={col.width} />
		));

		// add delete col when available
		if (!this.props.list.nodelete) {
			cols.unshift(
				<col width={TABLE_CONTROL_COLUMN_WIDTH} key="delete" />
			);
		}

		// add sort col when available
		if (this.props.list.sortable) {
			cols.unshift(
				<col width={TABLE_CONTROL_COLUMN_WIDTH} key="sortable" />
			);
		}

		return (
			<colgroup>
				{cols}
			</colgroup>
		);
	},
	renderHeaders () {
		let listControlCount = 0;

		if (this.props.list.sortable) listControlCount++;
		if (!this.props.list.nodelete) listControlCount++;

		// set active sort
		const activeSortPath = this.props.activeSort.paths[0];

		// pad first col when controls are available
		const cellPad = listControlCount ? (
			<th colSpan={listControlCount} />
		) : null;

		// map each heading column
		const cellMap = this.props.columns.map(col => {
			const isSelected = activeSortPath && activeSortPath.path === col.path;
			const isInverted = isSelected && activeSortPath.invert;
			const buttonTitle = `Sort by ${col.label}${isSelected && !isInverted ? ' (desc)' : ''}`;
			const colClassName = classnames('ItemList__sort-button th-sort', {
				'th-sort--asc': isSelected && !isInverted,
				'th-sort--desc': isInverted,
			});

			return (
				<th key={col.path} colSpan="1">
					<button
						className={colClassName}
						onClick={() => {
							this.props.handleSortSelect(
								col.path,
								isSelected && !isInverted
							);
						}}
						title={buttonTitle}>
						{col.label}
						<span className="th-sort__icon" />
					</button>
				</th>
			);
		});

		return (
			<thead>
				<tr>
					{cellPad}
					{cellMap}
				</tr>
			</thead>
		);
	},
	handleMediaClick (e) {
		var { items, manageMode, checkTableItem, router } = this.props;
		var href = e.target.dataset.href;
		if (manageMode && checkTableItem) {
			var index = e.target.dataset.index;
			checkTableItem(items.results[index], e);
		} else if (href && router) {
			router.push(href);
		}
	},
	render () {
		const { items } = this.props;
		if (!items.results.length) return null;

		if (this.props.list.isMediaCollection) {
			return (
				<div className="ItemList-wrapper">
					{items.results.map((item, i) => {
						if (item.fields.file && item.fields.file.url) {
							return (
								<div style={{ display: 'inline-block', width: '20%', padding: '0 10px', marginBottom: '20px' }} key={item.id}>
									<img
										style={{ width: '100%', cursor: 'pointer' }}
										src={item.fields.file.url}
										alt={item.fields.altText}
										onClick={this.handleMediaClick.bind(this)}
										data-index={i}
										data-href={`${Keystone.adminPath}/${this.props.list.path}/${item.id}`}
									/>
								</div>
							);
						}

						return null;
					})}
				</div>
			);
		}

		const tableBody = (this.props.list.sortable) ? (
			<DragDrop {...this.props} />
		) : (
			<tbody >
				{items.results.map((item, i) => {
					return (
						<TableRow key={item.id}
							deleteTableItem={this.props.deleteTableItem}
							index={i}
							sortOrder={item.sortOrder || 0}
							id={item.id}
							item={item}
							{...this.props}
						/>
					);
				})}
			</tbody>
		);

		return (
			<div className="ItemList-wrapper">
				<table cellPadding="0" cellSpacing="0" className="Table ItemList">
					{this.renderCols()}
					{this.renderHeaders()}
					{tableBody}
				</table>
			</div>
		);
	},
});

module.exports = exports = ItemsTable;

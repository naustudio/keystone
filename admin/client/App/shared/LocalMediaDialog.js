/**
 * Dialog show all uploaded Images
 */

import React from 'react';
import { Modal } from '../elemental';

const LocalMediaDialog = React.createClass({
	displayName: 'LocalMediaDialog',
	propTypes: {
		err: React.PropTypes.object,
		isOpen: React.PropTypes.bool,
		onCancel: React.PropTypes.func,
		onMediaClick: React.PropTypes.func,
	},
	getDefaultProps () {
		return {
			err: null,
			isOpen: false,
		};
	},
	componentDidMount () {
		var self = this;

		fetch('/keystone/api/media?sort=-createdAt')
		.then(function (res) {
			return res.json();
		}).then(function (res) {
			if (res && res.count) {
				self.setState({ media: res.results });
			}
		});
	},
	handleMediaClick (event) {
		event.preventDefault();
		var image = event.currentTarget;
		if (image && image.dataset.index && this.props.onMediaClick) {
			this.props.onMediaClick(this.state.media[image.dataset.index]);
		}
		if (this.props.onCancel) {
			this.props.onCancel();
		}
	},
	// Render the form itself
	renderForm () {
		if (!this.props.isOpen) return;
		var self = this;
		var media = this.state.media || [];

		return (
			<div>
				<Modal.Header
					text="Media"
					showCloseButton
				/>
				<Modal.Body>
					{media.map(function (item, index) {
						return (
							<div style={{ position: 'relative', display: 'inline-block', width: '33%', padding: '0 10px', marginBottom: '20px' }} key={item.id}>
								<img
									style={{ width: '100%', cursor: 'pointer' }}
									src={item.fields.file.url}
									alt={item.fields.altText}
									data-index={index}
									onClick={self.handleMediaClick.bind(self)}
								/>
							</div>
						);
					})}
				</Modal.Body>
			</div>
		);
	},
	render () {
		return (
			<Modal.Dialog
				isOpen={this.props.isOpen}
				onClose={this.props.onCancel}
				backdropClosesModal
			>
				{this.renderForm()}
			</Modal.Dialog>
		);
	},
});

module.exports = LocalMediaDialog;

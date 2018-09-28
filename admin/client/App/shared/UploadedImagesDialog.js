/**
 * Dialog show all uploaded Images
 */

import React from 'react';
import vkey from 'vkey';
import { Modal, Button } from '../elemental';

const UploadedImagesDialog = React.createClass({
	displayName: 'UploadedImagesDialog',
	propTypes: {
		err: React.PropTypes.object,
		isOpen: React.PropTypes.bool,
		onCancel: React.PropTypes.func,
	},
	getDefaultProps () {
		return {
			err: null,
			isOpen: false,
		};
	},
	componentWillReceiveProps (nextProps) {
		if (nextProps.isOpen !== this.props.isOpen && nextProps.isOpen) {
			var context = this;
			if (window.fetch) {
				window.fetch('/keystone/api/media/getAll')
				.then(function (res) {
					return res.json();
				})
				.then(function (res) {
					if (res && res.length) {
						context.setState({ imageList: res });
					}
				});
			}
		}
	},
	handleCopyImageLinkclick (evt) {
		var nextInput = evt.currentTarget.nextElementSibling;
		if (nextInput && nextInput.value) {
			nextInput.select();
			document.execCommand('copy');
			alert('Copied the text: ' + nextInput.value);
		}
	},
	// Render the form itself
	renderForm () {
		if (!this.props.isOpen) return;
		var imageList = this.state.imageList || [];
		var context = this;

		return (
			<div>
				<Modal.Header
					text="Uploaded Images"
					showCloseButton
				/>
				<Modal.Body>
					{imageList.map(function (image, index) {
						return (
							<div key={image.title} style={{ float: 'left', width: '30%', marginRight: '20px', clear: index % 3 === 0 ? 'left' : 'none' }}>
								<figure style={{ margin: '0 0 30px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
									<img src={image.value} style={{ width: '100%', marginBottom: '10px' }} />
									<figcaption title={image.title} style={{ marginBottom: '10px' }}>{image.title}</figcaption>
									<Button onClick={context.handleCopyImageLinkclick}>Copy Image Link</Button>
									<input style={{ position: 'fixed', left: '-100', width: '10px' }} type="text" value={window.location.origin + image.value} />
								</figure>
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

module.exports = UploadedImagesDialog;

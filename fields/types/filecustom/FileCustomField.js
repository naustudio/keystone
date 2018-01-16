/**
TODO:
- Format size of stored file (if present) using bytes package?
- Display file type icon? (see LocalFileField)
*/

import Field from '../Field';
import React, { PropTypes } from 'react';
import {
	Button,
	FormField,
	FormInput,
	FormNote,
} from '../../../admin/client/App/elemental';
import FileChangeMessage from '../../components/FileChangeMessage';
import HiddenFileInput from '../../components/HiddenFileInput';

let uploadInc = 1000;

const buildInitialState = (props) => ({
	action: null,
	removeExisting: false,
	uploadFieldPath: `File-${props.path}-${++uploadInc}`,
	userSelectedFile: null,
});

module.exports = Field.create({
	propTypes: {
		// hasPreviewImage: PropTypes.bool,
		autoCleanup: PropTypes.bool,
		collapse: PropTypes.bool,
		label: PropTypes.string,
		note: PropTypes.string,
		path: PropTypes.string.isRequired,
		value: PropTypes.shape({
			filename: PropTypes.string,
			// TODO: these are present but not used in the UI,
			//       should we start using them?
			// filetype: PropTypes.string,
			// originalname: PropTypes.string,
			// path: PropTypes.string,
			// size: PropTypes.number,
		}),
	},
	statics: {
		type: 'FileCustom',
		getDefaultValue: () => ({}),
	},
	// getDefaultProps () {
	// 	return {
	// 		hasPreviewImage: true,
	// 	};
	// },
	getInitialState () {
		return buildInitialState(this.props);
	},
	shouldCollapse () {
		return this.props.collapse && !this.hasExisting();
	},
	componentWillUpdate (nextProps) {
		// Show the new filename when it's finished uploading
		if (this.props.value.filename !== nextProps.value.filename) {
			this.setState(buildInitialState(nextProps));
		}
	},

	// ==============================
	// HELPERS
	// ==============================
	hasLocal () {
		return !!this.state.userSelectedFile;
	},
	hasFile () {
		return this.hasExisting() || this.hasLocal();
	},
	hasExisting () {
		return this.props.value && !!this.props.value.filename;
	},
	getFilename () {
		return this.state.userSelectedFile
			? this.state.userSelectedFile.name
			: this.props.value.filename;
	},
	getImageSource (height = 90) {
		let src;
		if (this.hasLocal()) {
			src = this.state.dataUri;
		} else if (this.hasExisting()) {
			src = this.props.value.url;
		}

		return src;
	},

	// ==============================
	// METHODS
	// ==============================

	triggerFileBrowser () {
		this.refs.fileInput.clickDomNode();
	},
	handleFileChange (event) {
		if (!window.FileReader) {
			return alert('File reader not supported by browser.');
		}

		var reader = new FileReader();
		var file = event.target.files[0];
		if (!file) return;

		// if (!file.type.match(SUPPORTED_REGEX)) {
		// 	return alert('Unsupported file type. Supported formats are: GIF, PNG, JPG, BMP, ICO, PDF, TIFF, EPS, PSD, SVG');
		// }

		reader.readAsDataURL(file);

		reader.onloadstart = () => {
			this.setState({
				loading: true,
			});
		};

		reader.onloadend = (upload) => {
			this.setState({
				dataUri: upload.target.result,
				loading: false,
				userSelectedFile: file,
			});
		};
	},
	handleRemove (e) {
		var state = {};

		if (this.state.userSelectedFile) {
			state = buildInitialState(this.props);
		} else if (this.hasExisting()) {
			state.removeExisting = true;

			if (this.props.autoCleanup) {
				if (e.altKey) {
					state.action = 'reset';
				} else {
					state.action = 'delete';
				}
			} else {
				if (e.altKey) {
					state.action = 'delete';
				} else {
					state.action = 'reset';
				}
			}
		}

		this.setState(state);
	},
	undoRemove () {
		this.setState(buildInitialState(this.props));
	},

	// ==============================
	// RENDERERS
	// ==============================
	renderImagePreview () {
		const styleImagePreview = {
			marginBottom: '15px',
			backgroundColor: 'white',
			borderRadius: '3px',
			border: '1px solid #ccc',
			display: 'inline-block',
			padding: '4px'
		};

		return (
			<div style={styleImagePreview}>
				<img src={this.getImageSource(180)} style={{height: 180}}></img>
			</div>
		);
	},
	renderFileNameAndChangeMessage () {
		const href = this.props.value ? this.props.value.url : undefined;
		return (
			<div>
				{(this.hasFile() && !this.state.removeExisting) ? (
					<FileChangeMessage>
						{this.getFilename()}
					</FileChangeMessage>
				) : null}
				{this.renderChangeMessage()}
			</div>
		);
	},
	renderChangeMessage () {
		if (this.state.userSelectedFile) {
			return (
				<FileChangeMessage color="success">
					Save to Upload
				</FileChangeMessage>
			);
		} else if (this.state.removeExisting) {
			return (
				<FileChangeMessage color="danger">
					File {this.props.autoCleanup ? 'deleted' : 'removed'} - save to confirm
				</FileChangeMessage>
			);
		} else {
			return null;
		}
	},
	renderClearButton () {
		if (this.state.removeExisting) {
			return (
				<Button variant="link" onClick={this.undoRemove}>
					Undo Remove
				</Button>
			);
		} else {
			var clearText;
			if (this.state.userSelectedFile) {
				clearText = 'Cancel Upload';
			} else {
				clearText = (this.props.autoCleanup ? 'Delete File' : 'Remove File');
			}
			return (
				<Button variant="link" color="cancel" onClick={this.handleRemove}>
					{clearText}
				</Button>
			);
		}
	},
	renderActionInput () {
		// If the user has selected a file for uploading, we need to point at
		// the upload field. If the file is being deleted, we submit that.
		if (this.state.userSelectedFile || this.state.action) {
			const value = this.state.userSelectedFile
				? `upload:${this.state.uploadFieldPath}`
				: (this.state.action === 'delete' ? 'remove' : '');
			return (
				<input
					name={this.getInputName(this.props.path)}
					type="hidden"
					value={value}
				/>
			);
		} else {
			return null;
		}
	},
	renderUI () {
		const { label, note, path, hasPreviewImage } = this.props;
		const buttons = (
			<div style={this.hasFile() ? { marginTop: '1em' } : null}>
				<Button onClick={this.triggerFileBrowser}>
					{this.hasFile() ? 'Change' : 'Upload'} File.
				</Button>
				{this.hasFile() && this.renderClearButton()}
			</div>
		);

		return (
			<div data-field-name={path} data-field-type="file">
				<FormField label={label} htmlFor={path}>
					{this.shouldRenderField() ? (
						<div>
							{/* {hasPreviewImage && this.hasFile() && this.renderImagePreview()} */}
							{this.hasFile() && this.renderImagePreview()}
							{this.hasFile() && this.renderFileNameAndChangeMessage()}
							{buttons}
							<HiddenFileInput
								key={this.state.uploadFieldPath}
								name={this.state.uploadFieldPath}
								onChange={this.handleFileChange}
								ref="fileInput"
							/>
							{this.renderActionInput()}
						</div>
					) : (
						<div>
							{this.hasFile()
								? this.renderFileNameAndChangeMessage()
								: <FormInput noedit>no file</FormInput>}
						</div>
					)}
					{!!note && <FormNote html={note} />}
				</FormField>
			</div>
		);
	},

});

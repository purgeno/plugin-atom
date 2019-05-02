'use babel';

import PackageView from './package-view';
import { CompositeDisposable } from 'atom';

export default {

	packageView: null,
	modalPanel: null,
	subscriptions: null,
	shift: false,
	pkgViewClick: false,
	opened: true,

	activate (state) {
		this.packageView = new PackageView(state.packageViewState);
		this.modalPanel = atom.workspace.addModalPanel({
			item: this.packageView.getElement(),
			visible: false,
		});

		this.subscriptions = new CompositeDisposable();

		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'jsDelivr:Add package': () => this.toggle(),
		}));

		this.subscriptions.add(atom.commands.add('.package-view', {
			'jsDelivr:Close view': () => atom.notifications.addInfo('Close'),
		}));

		atom.views.getView(this.packageView).addEventListener('mousedown', () => {
			this.pkgViewClick = true;
		});

		atom.views.getView(atom.workspace).addEventListener('mousedown', () => {
			if (this.pkgViewClick) {
				this.pkgViewClick = false;
				return;
			}

			if (this.opened) {
				this.toggle();
			}
		});

		atom.views.getView(this.packageView).addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				this.toggle();
			}

			if (e.key === 'Shift') {
				this.shift = true;
			}

			if (e.key === 'Tab') {
				e.preventDefault();
			}
		});

		atom.views.getView(this.packageView).addEventListener('keyup', (e) => {
			this.packageView.updateList();

			if (e.key === 'Shift') {
				this.shift = false;
			}

			if (e.key === 'Tab') {
				if (this.shift) {
					this.packageView.previousStep();
				} else {
					this.packageView.confirmSelection();
				}
			}
		});
	},

	deactivate () {
		this.modalPanel.destroy();
		this.subscriptions.dispose();
		this.packageView.destroy();
	},

	serialize () {
		return {
			packageViewState: this.packageView.serialize(),
		};
	},

	toggle () {
		this.packageView.reset();
		this.packageView.updateList();

		if (!this.opened) {
			this.modalPanel.show();
			this.packageView.focusFilterEditor();
			this.opened = true;
			return;
		}

		this.modalPanel.hide();
		this.opened = false;
	},
};
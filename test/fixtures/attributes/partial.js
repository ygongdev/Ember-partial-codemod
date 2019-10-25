import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';

export default Component.extend({
	actions: {
		action() {
			tryInvoke(this, 'action', [...arguments]);
		},
		action1() {
			tryInvoke(this, 'action1', [...arguments]);
		},
		action2() {
			tryInvoke(this, 'action2', [...arguments]);
		},
		action3() {
			tryInvoke(this, 'action3', [...arguments]);
		},
	}
});

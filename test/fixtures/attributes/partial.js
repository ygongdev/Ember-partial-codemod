import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';

export default Component.extend({
	actions: {
		action() {
			tryInvoke(this, 'action');
		},
		action1() {
			tryInvoke(this, 'action1');
		},
		action2() {
			tryInvoke(this, 'action2');
		},
		action3() {
			tryInvoke(this, 'action3');
		},
	}
});

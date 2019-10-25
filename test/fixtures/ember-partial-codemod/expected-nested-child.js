import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';

export default Component.extend({
	actions: {
		action2() {
			tryInvoke(this, 'action2', [...arguments]);
		},
	}
});

import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';

export default Component.extend({
	actions: {
		action1() {
			tryInvoke(this, 'action1');
		},
	}
});

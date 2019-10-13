import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';

export default Component.extend({
	actions: {
		actionName() {
			tryInvoke(this, 'actionName');
		},
	}
});

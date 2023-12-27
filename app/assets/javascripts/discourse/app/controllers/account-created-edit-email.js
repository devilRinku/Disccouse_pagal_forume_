import Controller from "@ember/controller";
import { inject as service } from "@ember/service";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { changeEmail } from "discourse/lib/user-activation";
import discourseComputed from "discourse-common/utils/decorators";

export default Controller.extend({
  router: service(),
  accountCreated: null,
  newEmail: null,

  @discourseComputed("newEmail", "accountCreated.email")
  submitDisabled(newEmail, currentEmail) {
    return newEmail === currentEmail;
  },

  actions: {
    changeEmail() {
      const email = this.newEmail;
      changeEmail({ email })
        .then(() => {
          this.set("accountCreated.email", email);
          this.router.transitionTo("account-created.resent");
        })
        .catch(popupAjaxError);
    },

    cancel() {
      this.router.transitionTo("account-created.index");
    },
  },
});

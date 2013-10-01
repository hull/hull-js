/*global define:true, describe:true, it:true, sinon:true */
define(['aura-extensions/component-normalize-id'], function (extension) {
  "use strict";
  var normalizeId = extension.normalizeId;

  describe('normalizing ID in components', function () {
    it('should not change options.id if available', function () {
      var id = "!@#";
      var normalized = normalizeId.call({}, {id: id});
      normalized.id.should.eql(id);
    });
    it('should generate a hash from the uid as the id', function () {
      var uid = "!@#";
      var that = {
        sandbox: {
          util: {
            entity: {
              encode: sinon.stub().returns('Did it!')
            }
          }
        }
      };
      var normalized = normalizeId.call(that, {uid: uid});
      normalized.id.should.eql('Did it!');
    });
    it('should return a static value otherwise', function () {
      var entityId = 'Yep';
      var that = {
        sandbox: {
          config: {
            entity_id: entityId
          }
        }
      };
      var normalized = normalizeId.call(that, {});
      normalized.id.should.eql(entityId);
    });
  });
});

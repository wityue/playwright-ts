import { test, expect } from './AbstractTestCase';

test.describe('登录', () => {
  test.describe.configure({ retries: 0 });
  test('多浏览器视频录制-1', async ({ 租户管理员, Flx业务员1_1 }) => {
    await test.step('Flx业务员1_1登录REL环境', async () => {
      await Flx业务员1_1.page.goto('https://oc-rel.onecontract-cloud.com');
      await Flx业务员1_1.登录页.登录("zlauto-05", "AKrYN49IfaXp7Wxw");
    });

    await test.step('租户管理员登录test环境', async () => {
      await 租户管理员.page.goto('https://oc-test.onecontract-cloud.com');
      await 租户管理员.登录页.登录("zl_automation", "AKrYN49IfaXp7Wxw");
    });

    await test.step('Flx业务员进入合同管理', async () => {
      await Flx业务员1_1.page.goto('https://oc-rel.onecontract-cloud.com/base/query');
      await Flx业务员1_1.page.waitForSelector('"合同起草"')
    });

    await test.step('租户管理员登录进入审批规则维护', async () => {
      await 租户管理员.page.goto('https://oc-test.onecontract-cloud.com/system/approvalRules');
      await 租户管理员.page.waitForSelector('[placeholder="请搜索审批规则名"]')
    });
  });
});
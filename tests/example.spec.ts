import { test, expect } from "./BaseTest";
import { Project } from "../data-factory/project";

test.describe("示例", () => {
  test.describe.configure({ retries: 2 });
  test("多用户异步用例-1", async ({ manager, user_1 }) => {
    await test.step("登录用户", async () => {
      const users = [
        {
          userPageInstance: manager,
          username: "manager",
          password: "cloud2018",
        },
        { userPageInstance: user_1, username: "user1", password: "cloud2018" },
      ];
      await Promise.all(
        users.map(async (user) => {
          const { userPageInstance, username, password } = user;
          await userPageInstance.LoginPage.goto();
          await userPageInstance.LoginPage.登录(username, password);
          await userPageInstance.DashboardPage.waitForMe();
        })
      );
    });
  });

  test("单用户登录用例-2-此用例将失败", async ({ user_2 }) => {
    await test.step("登录用户", async () => {
      await user_2.LoginPage.goto();
      await user_2.LoginPage.登录("user2", "cloud2018");
      await user_2.DashboardPage.waitForMe();
    });
    await test.step("断言我关注的元素数量", async () => {
      expect(await user_2.page.getByText(`我的关注`).count()).toBe(1);
    });
  });

  test("manager查看我的项目-3", async ({ manager }) => {
    await test.step("登录用户", async () => {
      await manager.LoginPage.goto();
      await manager.LoginPage.登录("manager", "cloud2018");
      await manager.DashboardPage.waitForMe();
    });
    await test.step("进入我的项目,查看第3行项目编码", async () => {
      await manager.MyProject.goto();
      const cell = await manager.MyProject.项目主表.getCellLocator(
        3,
        "项目编号"
      );
      console.log(await cell.innerText());
      const project = Project.create({});
      console.log(project);
    });
  });
});

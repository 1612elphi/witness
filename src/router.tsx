import { createBrowserRouter } from "react-router";
import RootLayout, { RootError } from "./routes/root.tsx";
import RepoList, { loader as repoListLoader } from "./routes/repo-list.tsx";
import RepoNew, { action as repoNewAction } from "./routes/repo-new.tsx";
import RepoHome, { loader as repoHomeLoader } from "./routes/repo-home.tsx";
import TreeView, { loader as treeLoader } from "./routes/tree.tsx";
import BlobView, { loader as blobLoader } from "./routes/blob.tsx";
import Branches, { loader as branchesLoader } from "./routes/branches.tsx";
import Commits, { loader as commitsLoader } from "./routes/commits.tsx";
import CommitDetail, { loader as commitLoader } from "./routes/commit.tsx";
import BranchNew, {
  action as branchNewAction,
  loader as branchNewLoader,
} from "./routes/branch-new.tsx";
import CommitNew, {
  action as commitNewAction,
  loader as commitNewLoader,
} from "./routes/commit-new.tsx";
import IssueNew, {
  action as issueNewAction,
  loader as issueNewLoader,
} from "./routes/issue-new.tsx";
import About from "./routes/about.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RootError />,
    children: [
      { index: true, element: <RepoList />, loader: repoListLoader },
      { path: "new", element: <RepoNew />, action: repoNewAction },
      { path: "about", element: <About /> },
      { path: "r/:repo", element: <RepoHome />, loader: repoHomeLoader },
      { path: "r/:repo/tree/:ref/*", element: <TreeView />, loader: treeLoader },
      { path: "r/:repo/blob/:ref/*", element: <BlobView />, loader: blobLoader },
      { path: "r/:repo/branches", element: <Branches />, loader: branchesLoader },
      { path: "r/:repo/commits/:ref", element: <Commits />, loader: commitsLoader },
      { path: "r/:repo/commit/:sig", element: <CommitDetail />, loader: commitLoader },
      {
        path: "r/:repo/issues/new",
        element: <IssueNew />,
        loader: issueNewLoader,
        action: issueNewAction,
      },
      {
        path: "r/:repo/new-branch",
        element: <BranchNew />,
        loader: branchNewLoader,
        action: branchNewAction,
      },
      {
        path: "r/:repo/commit-new/:ref",
        element: <CommitNew />,
        loader: commitNewLoader,
        action: commitNewAction,
      },
    ],
  },
]);

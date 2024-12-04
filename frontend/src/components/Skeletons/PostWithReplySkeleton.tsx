import PostSkeleton from "@/components/Skeletons/PostSkeleton";

const PostWithReplySkeleton = () => (
  <div className="flex w-full flex-col items-center">
    <PostSkeleton disableBottomMargin />
    <div className="h-4 w-1 bg-gray-300 dark:bg-gray-700"></div>
    <PostSkeleton comment maxWidth="max-w-lg" disableTopMargin />
  </div>
);

export default PostWithReplySkeleton;

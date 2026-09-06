import { redirect } from 'next/navigation'

/**
 * The CMS host serves one thing: the admin panel.
 *
 * This was Payload's scaffold page — the "Welcome to your new project" screen
 * with a link to the docs and a vscode:// link to open the file locally. Fine
 * on a laptop, odd on a live domain the brewery is given, and it made the root
 * of cms.pbc.christianbrown.uk look like something half-built.
 */
export default function CmsRoot() {
  redirect('/admin')
}

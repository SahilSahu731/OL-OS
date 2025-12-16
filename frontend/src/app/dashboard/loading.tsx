import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 pt-2">
      {/* Hero Skeleton */}
      <div className="w-full h-64 rounded-3xl bg-zinc-900 border border-zinc-800 p-8 flex flex-col justify-between">
            <div className="space-y-4">
                 <Skeleton className="h-4 w-32 bg-zinc-800" />
                 <Skeleton className="h-12 w-96 bg-zinc-800" />
                 <Skeleton className="h-4 w-64 bg-zinc-800" />
            </div>
            <Skeleton className="h-2 w-full max-w-md bg-zinc-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          {[1,2,3,4].map(i => (
              <Card key={i} className="md:col-span-1 bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                       <Skeleton className="h-4 w-20 bg-zinc-800" />
                       <Skeleton className="h-4 w-4 rounded-full bg-zinc-800" />
                  </CardHeader>
                  <CardContent>
                       <Skeleton className="h-8 w-16 bg-zinc-800" />
                  </CardContent>
              </Card>
          ))}

          {/* Main Content Area */}
          <Card className="md:col-span-2 lg:col-span-3 row-span-2 border-zinc-800 bg-zinc-900/30">
              <CardHeader>
                   <Skeleton className="h-6 w-48 bg-zinc-800" />
              </CardHeader>
              <CardContent className="space-y-4">
                   {[1,2,3,4,5].map(j => (
                       <Skeleton key={j} className="h-16 w-full rounded-xl bg-zinc-800" />
                   ))}
              </CardContent>
          </Card>
          
          {/* Sidebar Area */}
          <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-6">
               <Card className="h-48 border-zinc-800 bg-zinc-900/50">
                   <CardHeader><Skeleton className="h-4 w-32 bg-zinc-800" /></CardHeader>
                   <CardContent className="space-y-2">
                       <Skeleton className="h-4 w-full bg-zinc-800" />
                       <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                       <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                   </CardContent>
               </Card>
               <Card className="h-64 border-zinc-800 bg-zinc-900/50">
                    <CardHeader><Skeleton className="h-4 w-24 bg-zinc-800" /></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                         {[1,2,3,4].map(k => (
                             <Skeleton key={k} className="h-20 rounded-lg bg-zinc-800" />
                         ))}
                    </CardContent>
               </Card>
          </div>
      </div>
    </div>
  )
}

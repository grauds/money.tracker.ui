import { RequestParam } from "@lagoshny/ngx-hateoas-client";

export class SearchRequest {

  queryName: string | null = null

  queryArguments: RequestParam = {}

}
